"""Transaction-safe social rewards, ad accounting, and profit reconciliation."""

from datetime import date
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import hashlib
import sqlite3
import uuid

from flask import jsonify, request


CENT = Decimal("0.01")


def install_hardened_rewards(ns):
    from .journey_service import JourneyError, canonical_cart_upsert
    from .wallet_service import (
        WalletError,
        balance as canonical_balance,
        credit as wallet_credit,
        debit as wallet_debit,
        refund as wallet_refund,
        reverse as wallet_reverse,
    )

    app = ns["app"]
    get_db = ns["get_db"]
    db_one = ns["db_one"]
    db_all = ns["db_all"]
    require_auth = ns["require_auth"]
    require_admin = ns["require_admin"]
    post_with_author = ns["post_with_author"]
    create_notification = ns["create_notification"]
    broadcast_new_post_notification = ns["broadcast_new_post_notification"]
    upload_post_media = ns["upload_post_media_to_blob"]
    delete_post_media = ns["delete_post_media_blob"]
    allowed_media = ns["ALLOWED_IMAGES"] | ns["ALLOWED_VIDEOS"]
    max_file_bytes = ns["MAX_FILE_BYTES"]
    impression_reward = ns["COIN_REWARD_PER_IMPRESSION"]
    click_reward = ns["COIN_REWARD_PER_CLICK"]
    default_impression_cost = Decimal(str(ns["COST_PER_IMPRESSION"]))

    def execute(conn, sql, params=()):
        cursor = conn.cursor()
        cursor.execute(sql.replace("%s", "?") if isinstance(conn, sqlite3.Connection) else sql, params)
        return cursor

    def one(conn, sql, params=()):
        row = execute(conn, sql, params).fetchone()
        return dict(row) if row else None

    def rows(conn, sql, params=()):
        return [dict(row) for row in execute(conn, sql, params).fetchall()]

    def lock_suffix(conn):
        return "" if isinstance(conn, sqlite3.Connection) else " FOR UPDATE"

    def money(value, default="0"):
        try:
            return Decimal(str(default if value is None else value)).quantize(CENT, rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError):
            raise ValueError("Invalid monetary amount")

    def apply_coin_entry(conn, user_id, direction, amount, source_type, source_id, key):
        try:
            operation = wallet_credit if direction == "CREDIT" else wallet_debit
            result = operation(conn, user_id, amount, source_type, source_id, key)
            return result.created, float(result.balance)
        except WalletError as exc:
            raise ValueError(str(exc)) from exc

    def ledger_balance(conn, user_id):
        return float(canonical_balance(conn, user_id))

    def create_post():
        title = (request.form.get("title") or "").strip()[:180]
        content = (request.form.get("content") or "").strip()
        hashtags = ns["normalize_post_hashtags"](request.form.get("hashtags"))
        category = request.form.get("category") or "General Wellness"
        media = request.files.get("media")
        uid = str(request.current_user["id"])
        if not content and not media:
            return jsonify({"detail": "Please add text or media to your post"}), 400

        request_key = (request.headers.get("Idempotency-Key") or "").strip()[:128]
        post_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"jorniz:post:{uid}:{request_key}")) if request_key else str(uuid.uuid4())
        existing = db_one("SELECT * FROM posts WHERE id=%s", (post_id,)) if request_key else None
        if existing:
            result = post_with_author(existing, uid)
            result.update({"reward_earned": 0, "idempotent_replay": True})
            return jsonify(result), 200

        media_url = ""
        media_type = ""
        upload_warning = ""
        if media and media.filename:
            content_type = media.content_type or ""
            if content_type not in allowed_media:
                return jsonify({"detail": "Only images and videos are allowed"}), 400
            file_bytes = media.read()
            if len(file_bytes) > max_file_bytes:
                return jsonify({"detail": "File is too large"}), 400
            extension = ns["os"].path.splitext(media.filename)[1] or ".bin"
            pathname = f"posts/uploaded/{uid}/{post_id}/{uuid.uuid4()}{extension}"
            try:
                media_url = upload_post_media(file_bytes, pathname, content_type)
                media_type = "image" if content_type in ns["ALLOWED_IMAGES"] else "video"
            except Exception as exc:
                print(f"[WARN] Post media upload failed: {exc}")
                upload_warning = "Media upload failed. Your post was created without media."

        if not content and not media_url:
            return jsonify({"detail": "Please add text or successfully uploaded media to your post"}), 400

        conn = get_db()
        try:
            execute(
                conn,
                "INSERT INTO posts (id,creator_user_id,title,content,hashtags,media_url,media_type,category) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                (post_id, uid, title, content, hashtags, media_url, media_type, category),
            )
            rewarded, balance = apply_coin_entry(
                conn, uid, "CREDIT", 10, "SOCIAL_POST_REWARD", post_id, f"post_reward:{post_id}"
            )
            post = one(conn, "SELECT * FROM posts WHERE id=%s", (post_id,))
            conn.commit()
        except Exception:
            conn.rollback()
            if media_url:
                try:
                    delete_post_media(media_url)
                except Exception as cleanup_error:
                    print(f"[WARN] Could not remove orphaned post media: {cleanup_error}")
            raise
        finally:
            conn.close()

        actor = request.current_user.get("name", "Someone")
        snippet = content[:80] + ("..." if len(content) > 80 else "")
        try:
            broadcast_new_post_notification(uid, post_id, f'{actor} shared a new post: "{snippet}"' if snippet else f"{actor} shared a new post")
        except Exception as exc:
            print(f"[WARN] Post notification failed: {exc}")
        result = post_with_author(post, uid)
        result.update({"reward_earned": 10 if rewarded else 0, "new_hu_coins": balance})
        if upload_warning:
            result["warning"] = upload_warning
        return jsonify(result), 201

    def like_post(post_id):
        uid = str(request.current_user["id"])
        conn = get_db()
        post = None
        liked = False
        try:
            post = one(conn, "SELECT id,creator_user_id FROM posts WHERE id=%s" + lock_suffix(conn), (post_id,))
            if not post:
                conn.rollback()
                return jsonify({"detail": "Post not found"}), 404
            existing = one(conn, "SELECT id FROM post_likes WHERE post_id=%s AND user_id=%s", (post_id, uid))
            if existing:
                execute(conn, "DELETE FROM post_likes WHERE id=%s", (existing["id"],))
            else:
                execute(conn, "INSERT INTO post_likes (id,post_id,user_id) VALUES (%s,%s,%s)", (str(uuid.uuid4()), post_id, uid))
                liked = True
            count = one(conn, "SELECT COUNT(*) AS count FROM post_likes WHERE post_id=%s", (post_id,))["count"]
            execute(conn, "UPDATE posts SET likes=%s WHERE id=%s", (count, post_id))
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        if liked and str(post["creator_user_id"]) != uid:
            create_notification(post["creator_user_id"], uid, "like", post_id, f'{request.current_user.get("name", "Someone")} liked your post')
        return jsonify({"likes": count, "liked": liked})

    def record_post_view(post_id):
        uid = str(request.current_user["id"])
        conn = get_db()
        try:
            post = one(conn, "SELECT id,creator_user_id,views FROM posts WHERE id=%s" + lock_suffix(conn), (post_id,))
            if not post:
                conn.rollback()
                return jsonify({"detail": "Post not found"}), 404
            if str(post["creator_user_id"]) == uid:
                conn.rollback()
                return jsonify({"counted": False, "views": post.get("views") or 0})

            view_id = "view_" + uuid.uuid4().hex
            if isinstance(conn, sqlite3.Connection):
                cursor = execute(conn, "INSERT OR IGNORE INTO post_views (id,post_id,user_id) VALUES (%s,%s,%s)", (view_id, post_id, uid))
            else:
                cursor = execute(conn, "INSERT INTO post_views (id,post_id,user_id) VALUES (%s,%s,%s) ON CONFLICT(post_id,user_id) DO NOTHING", (view_id, post_id, uid))
            counted = cursor.rowcount == 1
            if counted:
                execute(conn, "UPDATE posts SET views=COALESCE(views,0)+1 WHERE id=%s", (post_id,))
                analytics_id = "ca_" + uuid.uuid4().hex
                if isinstance(conn, sqlite3.Connection):
                    execute(
                        conn,
                        """INSERT INTO creator_analytics (id,user_id,post_id,views,valid_views,reach)
                           VALUES (%s,%s,%s,1,1,1)
                           ON CONFLICT(user_id,post_id) DO UPDATE SET views=views+1,valid_views=valid_views+1,reach=reach+1""",
                        (analytics_id, post["creator_user_id"], post_id),
                    )
                else:
                    execute(
                        conn,
                        """INSERT INTO creator_analytics (id,user_id,post_id,views,valid_views,reach)
                           VALUES (%s,%s,%s,1,1,1)
                           ON CONFLICT(user_id,post_id) DO UPDATE SET
                           views=creator_analytics.views+1,valid_views=creator_analytics.valid_views+1,reach=creator_analytics.reach+1""",
                        (analytics_id, post["creator_user_id"], post_id),
                    )
            views = one(conn, "SELECT views FROM posts WHERE id=%s", (post_id,))["views"]
            conn.commit()
            return jsonify({"counted": counted, "views": views})
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def react_to_post(post_id):
        uid = str(request.current_user["id"])
        reaction_type = ((request.get_json(force=True) or {}).get("reaction_type") or "like").lower()
        valid = {"like", "celebrate", "support", "insightful", "mindblowing"}
        eligible = {"celebrate", "support", "insightful"}
        if reaction_type not in valid:
            return jsonify({"detail": "Invalid reaction type"}), 400

        conn = get_db()
        notify = False
        try:
            post = one(conn, "SELECT id,creator_user_id FROM posts WHERE id=%s" + lock_suffix(conn), (post_id,))
            if not post:
                conn.rollback()
                return jsonify({"detail": "Post not found"}), 404
            existing = one(conn, "SELECT id,reaction_type FROM post_reactions WHERE post_id=%s AND user_id=%s", (post_id, uid))
            old_type = existing["reaction_type"] if existing else None
            new_type = None if old_type == reaction_type else reaction_type
            if new_type is None:
                execute(conn, "DELETE FROM post_reactions WHERE id=%s", (existing["id"],))
            elif existing:
                execute(conn, "UPDATE post_reactions SET reaction_type=%s WHERE id=%s", (new_type, existing["id"]))
            else:
                execute(conn, "INSERT INTO post_reactions (id,post_id,user_id,reaction_type) VALUES (%s,%s,%s,%s)", ("rx_" + uuid.uuid4().hex, post_id, uid, new_type))

            author_id = str(post["creator_user_id"])
            old_rewarding = old_type in eligible and author_id != uid
            new_rewarding = new_type in eligible and author_id != uid
            if new_rewarding and not old_rewarding:
                apply_coin_entry(conn, author_id, "CREDIT", 5, "POST_REACTION_REWARD", post_id, f"reaction_reward:{post_id}:{uid}")
                notify = True
            elif old_rewarding and not new_rewarding:
                apply_coin_entry(conn, author_id, "DEBIT", 5, "POST_REACTION_REVERSAL", post_id, f"reaction_reversal:{post_id}:{uid}")

            counts = rows(conn, "SELECT reaction_type,COUNT(*) AS count FROM post_reactions WHERE post_id=%s GROUP BY reaction_type", (post_id,))
            breakdown = {name: 0 for name in valid}
            for item in counts:
                breakdown[item["reaction_type"]] = item["count"]
            total = sum(breakdown.values())
            analytics_id = "ca_" + uuid.uuid4().hex
            execute(
                conn,
                """INSERT INTO creator_analytics (id,user_id,post_id,engagement_count)
                   VALUES (%s,%s,%s,%s)
                   ON CONFLICT(user_id,post_id) DO UPDATE SET engagement_count=%s""",
                (analytics_id, author_id, post_id, total, total),
            )
            conn.commit()
        except ValueError as exc:
            conn.rollback()
            return jsonify({"detail": str(exc)}), 409
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        if notify:
            create_notification(author_id, uid, "reaction", post_id, f'{request.current_user.get("name", "Someone")} reacted {reaction_type} to your post')
        return jsonify({"total_reactions": total, "reactions_breakdown": breakdown, "my_reaction": new_type})

    def delete_post(post_id):
        uid = str(request.current_user["id"])
        media_url = ""
        reversed_amount = 0
        conn = get_db()
        try:
            post = one(conn, "SELECT id,creator_user_id,media_url FROM posts WHERE id=%s" + lock_suffix(conn), (post_id,))
            if not post:
                conn.rollback()
                return jsonify({"detail": "Post not found"}), 404
            if str(post["creator_user_id"]) != uid:
                conn.rollback()
                return jsonify({"detail": "You can only delete your own posts"}), 403
            media_url = post.get("media_url") or ""
            net = one(
                conn,
                """SELECT COALESCE(SUM(CASE WHEN credit_debit='CREDIT' THEN amount ELSE -amount END),0) AS amount
                   FROM wallet_ledger WHERE user_id=%s AND source_id=%s AND value_type='reward_coin'
                   AND LOWER(status) IN ('available','settled','spent','reversed')""",
                (uid, post_id),
            )["amount"]
            reversed_amount = max(0, float(net or 0))
            if reversed_amount:
                apply_coin_entry(conn, uid, "DEBIT", reversed_amount, "POST_DELETE_REVERSAL", post_id, f"post_delete:{post_id}")
            for table in ("post_views", "post_likes", "post_comments", "post_reactions"):
                execute(conn, f"DELETE FROM {table} WHERE post_id=%s", (post_id,))
            execute(conn, "DELETE FROM creator_analytics WHERE post_id=%s", (post_id,))
            execute(conn, "DELETE FROM posts WHERE id=%s", (post_id,))
            conn.commit()
        except ValueError as exc:
            conn.rollback()
            return jsonify({"detail": str(exc)}), 409
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

        response = {"message": "Post deleted", "reward_reversed": reversed_amount, "media_deleted": False}
        if media_url:
            try:
                response["media_deleted"] = delete_post_media(media_url)
            except Exception as cleanup_error:
                print(f"[WARN] Could not remove deleted post media: {cleanup_error}")
                response["warning"] = "Post deleted, but its media could not be removed."
        return jsonify(response)

    def rewards_summary():
        uid = str(request.current_user["id"])
        conn = get_db()
        try:
            balance = ledger_balance(conn, uid)
            transactions = rows(conn, "SELECT * FROM wallet_ledger WHERE user_id=%s ORDER BY created_at DESC LIMIT 20", (uid,))
            saved = one(conn, "SELECT COALESCE(SUM(coins_discount),0) AS total FROM orders WHERE user_id=%s AND status!='Cancelled'", (uid,))
            projection = one(conn, "SELECT hu_coins FROM users WHERE id=%s", (uid,))["hu_coins"]
            return jsonify({
                "hu_coins_balance": balance,
                "projected_balance": float(projection or 0),
                "reconciled": abs(balance - float(projection or 0)) < 0.001,
                "total_discount_saved_inr": float(saved["total"] or 0),
                "transactions": transactions,
            })
        finally:
            conn.close()

    def wallet_ledger():
        uid = str(request.current_user["id"])
        conn = get_db()
        try:
            entries = rows(conn, "SELECT * FROM wallet_ledger WHERE user_id=%s ORDER BY created_at DESC", (uid,))
            projection = one(conn, "SELECT hu_coins FROM users WHERE id=%s", (uid,))["hu_coins"]
            balance = ledger_balance(conn, uid)
            return jsonify({"balance": balance, "projected_balance": float(projection or 0), "reconciled": abs(balance - float(projection or 0)) < 0.001, "ledger": entries})
        finally:
            conn.close()

    def blocked_wallet_transfer():
        return jsonify({"detail": "Direct wallet credit is disabled; use a verified reward or payment flow"}), 403

    def add_to_cart():
        uid = str(request.current_user["id"])
        data = request.get_json(force=True) or {}
        conn = get_db()
        try:
            item = canonical_cart_upsert(conn, uid, data.get("product_id"), data.get("quantity", 1))
            return jsonify({"message": "Added to cart", "item": item}), 201
        except JourneyError as exc:
            return jsonify({"detail": str(exc)}), 409
        finally:
            conn.close()

    def get_cart():
        uid = str(request.current_user["id"])
        conn = get_db()
        try:
            items = rows(conn, """SELECT c.id,c.product_id,c.quantity,p.name,p.price,p.image_url,p.stock,
                p.reward_coins_earn,p.max_coin_redemption_percent
                FROM cart c JOIN products p ON p.id=c.product_id WHERE c.user_id=%s ORDER BY c.id""", (uid,))
            total = sum(float(item["price"]) * int(item["quantity"]) for item in items)
            return jsonify({"items": items, "total": total, "hu_coins_balance": ledger_balance(conn, uid)})
        finally:
            conn.close()

    def send_connection_request():
        uid = str(request.current_user["id"])
        receiver_id = str((request.get_json(force=True) or {}).get("receiver_id") or "")
        if not receiver_id or receiver_id == uid:
            return jsonify({"detail": "A different receiver is required"}), 400
        pair_key = ":".join(sorted((uid, receiver_id)))
        conn = get_db()
        try:
            if not one(conn, "SELECT id FROM users WHERE id=%s", (receiver_id,)):
                conn.rollback()
                return jsonify({"detail": "Receiver not found"}), 404
            existing = one(conn, "SELECT * FROM connections WHERE pair_key=%s", (pair_key,))
            if existing:
                conn.rollback()
                return jsonify({"message": "Connection request already exists", "connection_id": existing["id"], "status": existing["status"]})
            connection_id = "conn_" + uuid.uuid4().hex
            execute(conn, "INSERT INTO connections (id,requester_id,receiver_id,status,pair_key) VALUES (%s,%s,%s,'Pending',%s)",
                    (connection_id, uid, receiver_id, pair_key))
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        try:
            create_notification(receiver_id, uid, "connection_request", message=f'{request.current_user.get("name", "Someone")} sent you a connection request.')
        except Exception as exc:
            print(f"[WARN] Connection notification failed: {exc}")
        return jsonify({"message": "Connection request sent", "connection_id": connection_id, "status": "Pending"}), 201

    def creator_analytics():
        uid = str(request.current_user["id"])
        data = db_one(
            """SELECT COALESCE(SUM(views),0) AS views,COALESCE(SUM(valid_views),0) AS valid_views,
                      COALESCE(SUM(watch_time_sec),0) AS watch_time_sec,COALESCE(AVG(completion_rate),0) AS completion_rate,
                      COALESCE(SUM(reach),0) AS reach,COALESCE(SUM(engagement_count),0) AS engagement_count
               FROM creator_analytics WHERE user_id=%s""",
            (uid,),
        ) or {}
        earning_rows = db_all("SELECT earnings_state,COALESCE(SUM(amount),0) AS amount FROM creator_analytics WHERE user_id=%s GROUP BY earnings_state", (uid,))
        earnings = {"estimated": 0.0, "pending": 0.0, "approved": 0.0, "available": 0.0, "spent": 0.0, "withdrawn": 0.0, "reversed": 0.0}
        for item in earning_rows:
            state = str(item.get("earnings_state") or "estimated").lower()
            earnings[state] = float(item.get("amount") or 0)
        return jsonify({
            "views": int(data.get("views") or 0),
            "valid_views": int(data.get("valid_views") or 0),
            "watch_time_minutes": round(float(data.get("watch_time_sec") or 0) / 60, 1),
            "avg_completion_rate": round(float(data.get("completion_rate") or 0), 2),
            "reach": int(data.get("reach") or 0),
            "engagement_count": int(data.get("engagement_count") or 0),
            "earnings": earnings,
        })

    def create_campaign():
        uid = str(request.current_user["id"])
        data = request.get_json(force=True) or {}
        title = (data.get("title") or data.get("name") or "").strip()
        try:
            total = money(data.get("total_budget", data.get("budget")))
            daily = money(data.get("daily_budget", total))
            bid = money(data.get("bid_amount", "10"))
        except ValueError as exc:
            return jsonify({"detail": str(exc)}), 400
        if not title or total <= 0 or daily <= 0 or bid <= 0:
            return jsonify({"detail": "Title and positive budget values are required"}), 400

        conn = get_db()
        try:
            advertiser = one(conn, "SELECT * FROM advertisers WHERE user_id=%s" + lock_suffix(conn), (uid,))
            if not advertiser or not advertiser.get("verified"):
                conn.rollback()
                return jsonify({"detail": "A verified advertiser profile is required"}), 403
            if money(advertiser.get("prepaid_balance")) <= 0:
                conn.rollback()
                return jsonify({"detail": "Advertiser balance must be funded by an admin"}), 409
            campaign_id = "cmp_" + uuid.uuid4().hex
            creative_id = "cr_" + uuid.uuid4().hex
            image_url = data.get("image_url") or data.get("creative_url") or ""
            execute(
                conn,
                """INSERT INTO ad_campaigns
                   (id,advertiser_id,title,objective,total_budget,daily_budget,bid_type,bid_amount,placement,creative_url,target_geo,status)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (campaign_id, advertiser["id"], title, data.get("objective", "Brand Awareness"), float(total), float(daily), data.get("bid_type", "CPM").upper(), float(bid), data.get("placement", "Feed"), image_url, data.get("target_geo", "Global"), "Active"),
            )
            execute(
                conn,
                "INSERT INTO ad_creatives (id,campaign_id,title,headline,body_text,cta_text,cta_link,image_url) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                (creative_id, campaign_id, title, data.get("headline", title), data.get("body_text", ""), data.get("cta_text", "Learn More"), data.get("cta_link", ""), image_url),
            )
            campaign = one(conn, "SELECT * FROM ad_campaigns WHERE id=%s", (campaign_id,))
            conn.commit()
            campaign["creative_id"] = creative_id
            return jsonify(campaign), 201
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def my_campaigns():
        uid = str(request.current_user["id"])
        return jsonify(db_all("""SELECT c.* FROM ad_campaigns c JOIN advertisers a ON a.id=c.advertiser_id
                                 WHERE a.user_id=%s ORDER BY c.created_at DESC""", (uid,)))

    def update_campaign_status(campaign_id):
        uid = str(request.current_user["id"])
        status = str((request.get_json(force=True) or {}).get("status") or "").capitalize()
        if status not in {"Active", "Paused"}:
            return jsonify({"detail": "Status must be active or paused"}), 400
        owner = db_one("SELECT c.id FROM ad_campaigns c JOIN advertisers a ON a.id=c.advertiser_id WHERE c.id=%s AND a.user_id=%s", (campaign_id, uid))
        if not owner:
            return jsonify({"detail": "Campaign not found"}), 404
        ns["db_run"]("UPDATE ad_campaigns SET status=%s WHERE id=%s", (status, campaign_id))
        return jsonify({"message": "Campaign " + status.lower()})

    def delete_campaign(campaign_id):
        uid = str(request.current_user["id"])
        owner = db_one("SELECT c.id FROM ad_campaigns c JOIN advertisers a ON a.id=c.advertiser_id WHERE c.id=%s AND a.user_id=%s", (campaign_id, uid))
        if not owner:
            return jsonify({"detail": "Campaign not found"}), 404
        conn = get_db()
        try:
            execute(conn, "DELETE FROM ad_creatives WHERE campaign_id=%s", (campaign_id,))
            execute(conn, "DELETE FROM ad_campaigns WHERE id=%s", (campaign_id,))
            conn.commit()
            return jsonify({"message": "Campaign deleted"})
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def ad_event(event_type):
        uid = str(request.current_user["id"])
        data = request.get_json(force=True) or {}
        campaign_id = data.get("campaign_id")
        creative_id = data.get("creative_id")
        if not campaign_id or not creative_id:
            return jsonify({"detail": "campaign_id and creative_id are required"}), 400

        conn = get_db()
        try:
            campaign = one(
                conn,
                """SELECT c.*,a.user_id AS advertiser_user_id,a.prepaid_balance
                   FROM ad_campaigns c JOIN advertisers a ON a.id=c.advertiser_id
                   WHERE c.id=%s""" + lock_suffix(conn),
                (campaign_id,),
            )
            creative = one(conn, "SELECT id FROM ad_creatives WHERE id=%s AND campaign_id=%s", (creative_id, campaign_id))
            if not campaign or not creative:
                conn.rollback()
                return jsonify({"detail": "Campaign or creative not found"}), 404
            if str(campaign["advertiser_user_id"]) == uid:
                conn.rollback()
                return jsonify({"detail": "Advertisers cannot earn from their own campaign"}), 403
            if str(campaign.get("status") or "").lower() != "active":
                conn.rollback()
                return jsonify({"detail": "Campaign is not active"}), 409

            table = "ad_impressions" if event_type == "impression" else "ad_clicks"
            existing = one(conn, f"SELECT id FROM {table} WHERE campaign_id=%s AND user_id=%s", (campaign_id, uid))
            if existing:
                conn.rollback()
                return jsonify({"message": "already logged", "coins_earned": 0})

            bid_type = str(campaign.get("bid_type") or "CPM").upper()
            bid = money(campaign.get("bid_amount"), "0")
            if event_type == "impression":
                cost = bid / Decimal("1000") if bid_type == "CPM" else default_impression_cost
                reward = impression_reward
            else:
                cost = bid if bid_type == "CPC" else max(default_impression_cost * 5, Decimal("0.05"))
                reward = click_reward
            cost = money(cost)
            remaining = money(campaign["total_budget"]) - money(campaign.get("spent_amount"))
            available = money(campaign.get("prepaid_balance"))
            if cost <= 0 or remaining < cost or available < cost:
                execute(conn, "UPDATE ad_campaigns SET status='Paused' WHERE id=%s", (campaign_id,))
                conn.commit()
                return jsonify({"detail": "Campaign budget is exhausted"}), 409

            event_id = ("imp_" if event_type == "impression" else "clk_") + uuid.uuid4().hex
            execute(conn, f"INSERT INTO {table} (id,campaign_id,creative_id,user_id) VALUES (%s,%s,%s,%s)", (event_id, campaign_id, creative_id, uid))
            spent = money(campaign.get("spent_amount")) + cost
            new_status = "Paused" if spent >= money(campaign["total_budget"]) else "Active"
            execute(conn, "UPDATE ad_campaigns SET spent_amount=%s,status=%s WHERE id=%s", (float(spent), new_status, campaign_id))
            execute(conn, "UPDATE advertisers SET prepaid_balance=prepaid_balance-%s WHERE id=%s", (float(cost), campaign["advertiser_id"]))
            fingerprint = hashlib.sha256((request.headers.get("User-Agent") or "unknown").encode()).hexdigest()
            execute(
                conn,
                "INSERT INTO ad_analytics (id,campaign_id,user_id,event_type,ip_address,device_fp,is_valid,revenue_amount) VALUES (%s,%s,%s,%s,%s,%s,1,%s)",
                (event_id, campaign_id, uid, event_type, request.remote_addr, fingerprint, float(cost)),
            )
            _, balance = apply_coin_entry(conn, uid, "CREDIT", reward, f"AD_{event_type.upper()}_REWARD", event_id, f"ad:{event_type}:{campaign_id}:{uid}")
            conn.commit()
            return jsonify({"message": "logged", "coins_earned": reward, "hu_coins": balance, "validated_revenue": float(cost)})
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def log_impression():
        return ad_event("impression")

    def log_click():
        return ad_event("click")

    def deposit_advertiser_balance():
        data = request.get_json(force=True) or {}
        advertiser_id = data.get("advertiser_id")
        try:
            amount = money(data.get("amount"))
        except ValueError as exc:
            return jsonify({"detail": str(exc)}), 400
        if not advertiser_id or amount <= 0:
            return jsonify({"detail": "advertiser_id and a positive amount are required"}), 400
        conn = get_db()
        try:
            execute(conn, "UPDATE advertisers SET prepaid_balance=prepaid_balance+%s WHERE id=%s", (float(amount), advertiser_id))
            advertiser = one(conn, "SELECT prepaid_balance FROM advertisers WHERE id=%s", (advertiser_id,))
            if not advertiser:
                conn.rollback()
                return jsonify({"detail": "Advertiser not found"}), 404
            conn.commit()
            return jsonify({"message": "Advertiser balance funded", "new_balance": float(advertiser["prepaid_balance"])})
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def reconcile_revenue():
        data = request.get_json(force=True) or {}
        period = str(data.get("period_date") or date.today().isoformat())
        try:
            date.fromisoformat(period)
        except ValueError:
            return jsonify({"detail": "period_date must be YYYY-MM-DD"}), 400
        conn = get_db()
        try:
            gross_row = one(conn, "SELECT COALESCE(SUM(revenue_amount),0) AS amount FROM ad_analytics WHERE is_valid=1 AND DATE(created_at)=%s", (period,))
            gross = money(gross_row["amount"] if gross_row else 0)
            taxes = money(data.get("taxes"), gross * Decimal("0.18"))
            charges = money(data.get("payment_charges"), gross * Decimal("0.02"))
            invalid = money(data.get("invalid_traffic"), "0")
            refunds = money(data.get("refunds"), "0")
            campaign_costs = money(data.get("campaign_costs"), "0")
            deductions = (taxes, charges, invalid, refunds, campaign_costs)
            if any(item < 0 for item in deductions):
                conn.rollback()
                return jsonify({"detail": "Deductions cannot be negative"}), 400
            eligible = max(Decimal("0"), gross - sum(deductions, Decimal("0")))
            pools = {
                "creator_pool": money(eligible * Decimal("0.40")),
                "consumer_pool": money(eligible * Decimal("0.20")),
                "platform_share": money(eligible * Decimal("0.30")),
                "partner_share": money(eligible * Decimal("0.10")),
            }
            values = ("rev_" + uuid.uuid4().hex, period, float(gross), float(taxes), float(charges), float(invalid), float(refunds), float(campaign_costs), float(eligible), *(float(v) for v in pools.values()))
            execute(
                conn,
                """INSERT INTO revenue_distribution_logs
                   (id,period_date,gross_validated_revenue,taxes_deducted,payment_charges,invalid_traffic_deduction,
                    refunds_deducted,campaign_costs,eligible_net_revenue,creator_pool,consumer_pool,platform_share,partner_share)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                   ON CONFLICT(period_date) DO UPDATE SET
                    gross_validated_revenue=excluded.gross_validated_revenue,taxes_deducted=excluded.taxes_deducted,
                    payment_charges=excluded.payment_charges,invalid_traffic_deduction=excluded.invalid_traffic_deduction,
                    refunds_deducted=excluded.refunds_deducted,campaign_costs=excluded.campaign_costs,
                    eligible_net_revenue=excluded.eligible_net_revenue,creator_pool=excluded.creator_pool,
                    consumer_pool=excluded.consumer_pool,platform_share=excluded.platform_share,partner_share=excluded.partner_share""",
                values,
            )
            conn.commit()
            return jsonify({"message": "Revenue reconciliation completed", "period_date": period, "gross_validated_revenue": float(gross), "eligible_net_revenue": float(eligible), "pools": {k: float(v) for k, v in pools.items()}})
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def process_checkout():
        uid = str(request.current_user["id"])
        data = request.get_json(force=True) or {}
        use_coins = bool(data.get("use_coins", True))
        address = data.get("address", "Standard Delivery Address")
        request_key = str(request.headers.get("Idempotency-Key") or data.get("idempotency_key") or "").strip()[:128]
        if not request_key:
            return jsonify({"detail": "Idempotency-Key is required for checkout"}), 400
        order_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"jorniz:checkout:{uid}:{request_key}")) if request_key else "ord_" + uuid.uuid4().hex

        conn = get_db()
        try:
            if request_key:
                existing = one(conn, "SELECT * FROM orders WHERE id=%s AND user_id=%s", (order_id, uid))
                if existing:
                    conn.rollback()
                    existing["idempotent_replay"] = True
                    return jsonify(existing)

            user = one(conn, "SELECT hu_coins FROM users WHERE id=%s" + lock_suffix(conn), (uid,))
            if not user:
                conn.rollback()
                return jsonify({"detail": "User account not found"}), 404
            cart = rows(
                conn,
                """SELECT c.product_id,c.quantity,c.price,p.name,p.stock,p.reward_coins_earn,p.max_coin_redemption_percent
                   FROM cart c JOIN products p ON p.id=c.product_id WHERE c.user_id=%s""" + lock_suffix(conn),
                (uid,),
            )
            if not cart:
                conn.rollback()
                return jsonify({"detail": "Cart is empty"}), 400
            for item in cart:
                if int(item["quantity"] or 0) <= 0 or int(item["stock"] or 0) < int(item["quantity"]):
                    conn.rollback()
                    return jsonify({"detail": f"Insufficient stock for {item['name']}"}), 409

            total = money(sum(Decimal(str(item["price"])) * int(item["quantity"]) for item in cart))
            max_percent = min(int(item.get("max_coin_redemption_percent") or 50) for item in cart)
            available_coins = int(ledger_balance(conn, uid))
            maximum_coins = int((total * Decimal(max_percent) / Decimal("100")) * Decimal("10"))
            coins_spent = min(available_coins, maximum_coins) if use_coins else 0
            discount = money(Decimal(coins_spent) / Decimal("10"))
            gateway_spent = money(total - discount)
            coins_earned = sum(int(item["quantity"]) * int(item.get("reward_coins_earn") or 0) for item in cart)

            if gateway_spent > 0:
                conn.rollback()
                return jsonify({
                    "detail": "External payment is required and is not configured",
                    "payment_required": True,
                    "total_amount": float(total),
                    "coins_spent": coins_spent,
                    "coins_discount": float(discount),
                    "gateway_spent": float(gateway_spent),
                }), 409

            execute(
                conn,
                """INSERT INTO orders
                   (id,user_id,total_amount,wallet_spent,gateway_spent,coins_spent,coins_discount,coins_earned,
                    status,shipping_address,payment_method,idempotency_key,payment_status,gateway_refund_status)
                   VALUES (%s,%s,%s,0,%s,%s,%s,%s,'Confirmed',%s,'HU_Coins',%s,'paid','not_required')""",
                (order_id, uid, float(total), float(gateway_spent), coins_spent, float(discount), coins_earned, address, request_key),
            )
            for item in cart:
                execute(conn, "UPDATE products SET stock=stock-%s WHERE id=%s", (item["quantity"], item["product_id"]))
                execute(conn, "INSERT INTO order_items (id,order_id,product_id,quantity,price) VALUES (%s,%s,%s,%s,%s)", (str(uuid.uuid4()), order_id, item["product_id"], item["quantity"], item["price"]))

            balance = float(user.get("hu_coins") or 0)
            if coins_spent:
                _, balance = apply_coin_entry(conn, uid, "DEBIT", coins_spent, "ECOMMERCE_CHECKOUT_REDEMPTION", order_id, f"checkout_debit:{order_id}")
            if coins_earned:
                _, balance = apply_coin_entry(conn, uid, "CREDIT", coins_earned, "ECOMMERCE_ORDER_REWARD", order_id, f"checkout_reward:{order_id}")
            execute(conn, "DELETE FROM cart WHERE user_id=%s", (uid,))
            conn.commit()
            return jsonify({
                "message": "Order placed successfully",
                "order_id": order_id,
                "total_amount": float(total),
                "coins_spent": coins_spent,
                "coins_discount": float(discount),
                "coins_earned": coins_earned,
                "gateway_spent": float(gateway_spent),
                "status": "Confirmed",
                "new_hu_coins": balance,
            }), 201
        except ValueError as exc:
            conn.rollback()
            return jsonify({"detail": str(exc)}), 409
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def cancel_order(order_id):
        uid = str(request.current_user["id"])
        conn = get_db()
        try:
            order = one(conn, "SELECT * FROM orders WHERE id=%s AND user_id=%s" + lock_suffix(conn), (order_id, uid))
            if not order:
                conn.rollback()
                return jsonify({"detail": "Order not found"}), 404
            status = str(order.get("status") or "").lower()
            if status == "cancelled":
                conn.rollback()
                return jsonify({"message": "Order already cancelled", "order_id": order_id, "idempotent_replay": True})
            if status not in {"confirmed", "processing"}:
                conn.rollback()
                return jsonify({"detail": "This order cannot be cancelled in its current state"}), 409

            items = rows(conn, "SELECT product_id,quantity FROM order_items WHERE order_id=%s", (order_id,))
            coins_spent = int(order.get("coins_spent") or 0)
            coins_earned = int(order.get("coins_earned") or 0)
            balance = one(conn, "SELECT hu_coins FROM users WHERE id=%s", (uid,))["hu_coins"]
            if coins_spent:
                debit_entry = one(conn, "SELECT id FROM wallet_ledger WHERE idempotency_key=%s", (f"checkout_debit:{order_id}",))
                if not debit_entry:
                    raise ValueError("Original checkout debit was not found")
                balance = wallet_refund(conn, uid, debit_entry["id"], f"cancel_refund:{order_id}",
                                        source_type="ORDER_CANCEL_COIN_REFUND", source_id=order_id).balance
            if coins_earned:
                reward_entry = one(conn, "SELECT id FROM wallet_ledger WHERE idempotency_key=%s", (f"checkout_reward:{order_id}",))
                if not reward_entry:
                    raise ValueError("Original order reward was not found")
                balance = wallet_reverse(conn, uid, reward_entry["id"], f"cancel_reward_reversal:{order_id}",
                                         source_type="ORDER_CANCEL_COIN_REVERSAL", source_id=order_id).balance
            for item in items:
                execute(conn, "UPDATE products SET stock=stock+%s WHERE id=%s", (item["quantity"], item["product_id"]))
            execute(conn, """UPDATE orders SET status='Cancelled',refund_status='CoinsRefunded',
                payment_status='refunded',gateway_refund_status='not_required' WHERE id=%s""", (order_id,))
            conn.commit()
            return jsonify({"message": "Order cancelled and rewards adjusted", "order_id": order_id, "refunded_coins": coins_spent, "reversed_coins": coins_earned, "new_hu_coins": float(balance)})
        except ValueError as exc:
            conn.rollback()
            return jsonify({"detail": str(exc)}), 409
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def apply_for_job(job_id):
        uid = str(request.current_user["id"])
        data = request.get_json(force=True) or {}
        conn = get_db()
        try:
            job = one(conn, "SELECT id,is_active FROM jobs WHERE id=%s" + lock_suffix(conn), (job_id,))
            if not job or not job.get("is_active"):
                conn.rollback()
                return jsonify({"detail": "Active job not found"}), 404
            existing = one(conn, "SELECT id FROM job_applications WHERE job_id=%s AND candidate_id=%s", (job_id, uid))
            if existing:
                conn.rollback()
                return jsonify({"detail": "You already applied to this job"}), 409
            application_id = "app_" + uuid.uuid4().hex
            execute(conn, "INSERT INTO job_applications (id,job_id,candidate_id,selected_cv_id,cover_letter,status) VALUES (%s,%s,%s,%s,%s,%s)", (application_id, job_id, uid, data.get("selected_cv_id"), data.get("cover_letter", ""), "Submitted"))
            execute(conn, "UPDATE jobs SET applicants=COALESCE(applicants,0)+1 WHERE id=%s", (job_id,))
            _, balance = apply_coin_entry(conn, uid, "CREDIT", 20, "JOB_APPLICATION_REWARD", application_id, f"job_application:{job_id}:{uid}")
            conn.commit()
            return jsonify({"message": "Application submitted", "application_id": application_id, "reward_earned": 20, "new_hu_coins": balance}), 201
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def accept_connection(conn_id):
        uid = str(request.current_user["id"])
        conn = get_db()
        try:
            connection = one(conn, "SELECT * FROM connections WHERE id=%s AND receiver_id=%s" + lock_suffix(conn), (conn_id, uid))
            if not connection:
                conn.rollback()
                return jsonify({"detail": "Connection request not found"}), 404
            if str(connection.get("status")).lower() == "accepted":
                conn.rollback()
                return jsonify({"message": "Connection already accepted", "status": "Accepted", "idempotent_replay": True})
            if str(connection.get("status")).lower() != "pending":
                conn.rollback()
                return jsonify({"detail": "Connection request is not pending"}), 409
            execute(conn, "UPDATE connections SET status='Accepted' WHERE id=%s", (conn_id,))
            _, balance = apply_coin_entry(conn, uid, "CREDIT", 10, "CONNECTION_REWARD", conn_id, f"connection_accept:{conn_id}:{uid}")
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        create_notification(connection["requester_id"], uid, "connection_accept", message=f'{request.current_user.get("name", "Someone")} accepted your connection request.')
        return jsonify({"message": "Connection request accepted", "status": "Accepted", "new_hu_coins": balance})

    def endorse_skill():
        uid = str(request.current_user["id"])
        data = request.get_json(force=True) or {}
        recipient = str(data.get("recipient_id") or "")
        skill = (data.get("skill_name") or "").strip()
        if not recipient or not skill or recipient == uid:
            return jsonify({"detail": "A different recipient and skill name are required"}), 400
        conn = get_db()
        try:
            if not one(conn, "SELECT id FROM users WHERE id=%s", (recipient,)):
                conn.rollback()
                return jsonify({"detail": "Recipient not found"}), 404
            if one(conn, "SELECT id FROM skill_endorsements WHERE endorser_id=%s AND recipient_id=%s AND skill_name=%s", (uid, recipient, skill)):
                conn.rollback()
                return jsonify({"detail": "You already endorsed this skill"}), 409
            endorsement_id = "end_" + uuid.uuid4().hex
            execute(conn, "INSERT INTO skill_endorsements (id,endorser_id,recipient_id,skill_name) VALUES (%s,%s,%s,%s)", (endorsement_id, uid, recipient, skill))
            apply_coin_entry(conn, uid, "CREDIT", 5, "SKILL_ENDORSEMENT_REWARD", endorsement_id, f"endorsement:{endorsement_id}:{uid}")
            apply_coin_entry(conn, recipient, "CREDIT", 5, "SKILL_ENDORSEMENT_REWARD", endorsement_id, f"endorsement:{endorsement_id}:{recipient}")
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        create_notification(recipient, uid, "endorsement", message=f'{request.current_user.get("name", "Someone")} endorsed your skill in {skill}.')
        return jsonify({"message": f"Endorsed {skill}; both users earned 5 HU Coins", "endorsement_id": endorsement_id})

    def attend_event(event_id):
        uid = str(request.current_user["id"])
        conn = get_db()
        try:
            event = one(conn, "SELECT id,reward_coins FROM events WHERE id=%s" + lock_suffix(conn), (event_id,))
            if not event:
                conn.rollback()
                return jsonify({"detail": "Event not found"}), 404
            existing = one(conn, "SELECT id FROM event_attendees WHERE event_id=%s AND user_id=%s", (event_id, uid))
            if existing:
                conn.rollback()
                return jsonify({"message": "Already registered", "reward_earned": 0})
            attendee_id = "att_" + uuid.uuid4().hex
            execute(conn, "INSERT INTO event_attendees (id,event_id,user_id) VALUES (%s,%s,%s)", (attendee_id, event_id, uid))
            execute(conn, "UPDATE events SET attendee_count=COALESCE(attendee_count,0)+1 WHERE id=%s", (event_id,))
            reward = int(event.get("reward_coins") or 0)
            _, balance = apply_coin_entry(conn, uid, "CREDIT", reward, "CME_EVENT_REGISTRATION", event_id, f"event_attendance:{event_id}:{uid}")
            conn.commit()
            return jsonify({"message": "Successfully registered for event", "reward_earned": reward, "new_hu_coins": balance})
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    replacements = {
        "create_post": require_auth(create_post),
        "like_post": require_auth(like_post),
        "delete_post": require_auth(delete_post),
        "react_to_post": require_auth(react_to_post),
        "get_rewards_summary": require_auth(rewards_summary),
        "get_wallet_ledger": require_auth(wallet_ledger),
        "wallet_transfer": require_auth(blocked_wallet_transfer),
        "add_to_cart": require_auth(add_to_cart),
        "get_cart": require_auth(get_cart),
        "get_creator_analytics": require_auth(creator_analytics),
        "create_campaign": require_auth(create_campaign),
        "my_campaigns": require_auth(my_campaigns),
        "update_campaign_status": require_auth(update_campaign_status),
        "delete_campaign": require_auth(delete_campaign),
        "log_impression": require_auth(log_impression),
        "log_click": require_auth(log_click),
        "deposit_advertiser_balance": require_admin(deposit_advertiser_balance),
        "reconcile_revenue_distribution": require_admin(reconcile_revenue),
        "process_checkout": require_auth(process_checkout),
        "cancel_order": require_auth(cancel_order),
        "send_connection_request": require_auth(send_connection_request),
        "apply_for_job": require_auth(apply_for_job),
        "accept_connection_request": require_auth(accept_connection),
        "endorse_skill": require_auth(endorse_skill),
        "attend_event": require_auth(attend_event),
    }
    app.view_functions.update(replacements)
    if "record_post_view" not in app.view_functions:
        app.add_url_rule("/api/posts/<post_id>/view", "record_post_view", require_auth(record_post_view), methods=["POST"])

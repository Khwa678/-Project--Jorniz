// ─── api.js — Healthy Universe ───────────────────────────────────────────────
// Precedence:
// 1) window.__JORNIZ_API_BASE__ (set via deployment wrapper or local debug)
// 2) <meta name="jorniz-api-base">
// 3) Same-origin fallback (useful for local proxy setups)
var HU_API = (function resolveHuApiBase() {
  var fromGlobal = (window.__JORNIZ_API_BASE__ || "").trim();
  if (fromGlobal) return fromGlobal;

  var meta = (document.querySelector("meta[name='jorniz-api-base']") || {}).content || "";
  meta = (meta || "").trim();
  if (meta) return meta;

  return window.location.origin;
})();

// ── Letter Avatar Generator ───────────────────────────────────────────────────
function getLetterAvatar(name, size) {
  size = size || 80;
  var letter = (name || "U").charAt(0).toUpperCase();
  var colors = [
    "#22c55e",
    "#16a34a",
    "#0ea5e9",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#14b8a6",
  ];
  var color = colors[letter.charCodeAt(0) % colors.length];
  var canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font =
    "bold " + Math.round(size * 0.42) + "px DM Sans, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, size / 2, size / 2 + 1);
  return canvas.toDataURL();
}

function timeAgo(dateStr) {
  if (!dateStr) return "Just now";
  var diffMs = Date.now() - new Date(dateStr).getTime();
  var mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  var days = Math.floor(hrs / 24);
  return days + "d ago";
}

// ── Token helpers ─────────────────────────────────────────────────────────────
function huGetToken() {
  return localStorage.getItem("hu_token");
}
function huGetUser() {
  try {
    return JSON.parse(localStorage.getItem("hu_user") || "null");
  } catch (e) {
    return null;
  }
}
function huLogout() {
  localStorage.removeItem("hu_token");
  localStorage.removeItem("hu_user");
  window.location.href = "auth.html";
}

// ── Auth Guard Helper ─────────────────────────────────────────────────────────
function huRequireAuth() {
  // Allow seamless guest interaction across all Explore, People, and Store cards
  return true;
}

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
async function huFetch(path, options) {
  options = options || {};
  var token = huGetToken();
  var headers = Object.assign({}, options.headers || {});
  if (token && !(options.body instanceof FormData)) {
    headers["Authorization"] = "Bearer " + token;
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  } else if (token) {
    headers["Authorization"] = "Bearer " + token;
  }
  var res = await fetch(
    HU_API + path,
    Object.assign({}, options, { headers: headers }),
  );
  if (res.status === 401) {
    // Return null without redirecting to auth.html so guest users can stay on the page
    return null;
  }
  return res;
}

// ── Create Post ───────────────────────────────────────────────────────────────
async function huCreatePost(opts) {
  var fd = new FormData();
  fd.append("content", opts.content || "");
  fd.append("category", opts.category || "General Wellness");
  if (opts.mediaFile) fd.append("media", opts.mediaFile);
  var res = await huFetch("/api/posts/create", { method: "POST", body: fd });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create post");
  return data;
}

// ── Fetch Feed ────────────────────────────────────────────────────────────────
async function huGetFeed(limit, offset) {
  limit = limit || 20;
  offset = offset || 0;
  try {
    var res = await huFetch("/api/posts?limit=" + limit + "&offset=" + offset, {
      method: "GET",
    });
    if (!res || !res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

// ── Like Post (real per-user toggle, not just a counter) ──────────────────────
async function huLikePost(postId) {
  var res = await huFetch("/api/posts/" + postId + "/like", { method: "POST" });
  if (!res || !res.ok) return null;
  return await res.json(); // { likes, liked }
}

// ── Share / reshare a post ─────────────────────────────────────────────────────
async function huSharePost(postId) {
  try {
    var res = await fetch(HU_API + "/api/posts/" + postId + "/share", {
      method: "POST",
    });
    if (!res.ok) return null;
    return await res.json(); // { shares }
  } catch (e) {
    return null;
  }
}

// ── Comments ───────────────────────────────────────────────────────────────────
async function huGetComments(postId) {
  try {
    var res = await fetch(HU_API + "/api/posts/" + postId + "/comments");
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

async function huAddComment(postId, content) {
  var res = await huFetch("/api/posts/" + postId + "/comments", {
    method: "POST",
    body: JSON.stringify({ content: content }),
  });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Could not add comment");
  return data;
}

// ── Notifications (real: like/comment → post owner only, post → everyone) ─────
async function huGetNotifications() {
  var res = await huFetch("/api/notifications");
  if (!res || !res.ok) return [];
  return await res.json();
}

async function huGetUnreadNotificationCount() {
  var res = await huFetch("/api/notifications/unread-count");
  if (!res || !res.ok) return 0;
  var data = await res.json();
  return data.unread || 0;
}

async function huMarkNotificationRead(id) {
  var res = await huFetch("/api/notifications/" + id + "/read", {
    method: "POST",
  });
  if (!res) return null;
  return await res.json();
}

async function huMarkAllNotificationsRead() {
  var res = await huFetch("/api/notifications/read-all", { method: "POST" });
  if (!res) return null;
  return await res.json();
}

// ── Generic "browse a photo" upload helper (doctor avatar, job/company logo…) ──
async function huUploadImage(file) {
  var fd = new FormData();
  fd.append("file", file);
  var res = await huFetch("/api/upload/image", { method: "POST", body: fd });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Could not upload image");
  return data.url; // public URL
}

// ── Apply all user data to UI ─────────────────────────────────────────────────
function applyUserToUI() {
  var u = huGetUser();
  if (!u) return;

  var name = u.name || "User";
  var role = u.specialty || "Member";
  var bal = parseFloat(u.balance || 0).toFixed(2);
  var coins = u.hu_coins || 500;
  var email = u.email || "";
  var hospital = u.hospital || "";
  var bio = u.bio || "";
  var created = u.created_at
    ? new Date(u.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "";

  // Generate letter avatars at different sizes
  var avatarSm = getLetterAvatar(name, 72); // sidebar, modal
  var avatarLg = getLetterAvatar(name, 160); // profile, settings

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  var sName = document.getElementById("sidebar-user-name");
  var sRole = document.getElementById("sidebar-user-role");
  var sAv = document.getElementById("sidebar-avatar");
  if (sName)
    sName.textContent = name.length > 14 ? name.slice(0, 14) + "…" : name;
  if (sRole) sRole.textContent = role;
  if (sAv) {
    sAv.src = avatarSm;
    sAv.alt = name.charAt(0).toUpperCase();
  }

  // ── Balances ─────────────────────────────────────────────────────────────────
  ["user-balance", "mobile-user-balance", "wallet-balance"].forEach(
    function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = bal;
    },
  );
  var wAvail = document.getElementById("withdraw-avail");
  if (wAvail) wAvail.textContent = "$" + bal;

  // ── HU Coins ──────────────────────────────────────────────────────────────────
  ["sidebar-hu-coins", "rp-coins", "wallet-coins", "rev-coins"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = coins.toLocaleString();
  });
  ["wallet-coins-inr", "rev-coins-inr"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = Math.round(coins / 10);
  });
  var cc = document.getElementById("consult-coins");
  if (cc) cc.textContent = coins.toLocaleString();

  // ── Rev balance ───────────────────────────────────────────────────────────────
  var rb = document.getElementById("rev-balance");
  if (rb) rb.textContent = bal;

  // ── Booking payment labels ────────────────────────────────────────────────────
  var bCoins = document.getElementById("booking-coins-label");
  var bBal = document.getElementById("booking-balance-label");
  if (bCoins) bCoins.textContent = coins.toLocaleString() + " coins available";
  if (bBal) bBal.textContent = "$" + bal + " available";

  // ── Create post modal ─────────────────────────────────────────────────────────
  var mName = document.getElementById("modal-user-name");
  var mAv = document.getElementById("modal-user-avatar");
  if (mName) mName.textContent = name;
  if (mAv) {
    mAv.src = avatarSm;
    mAv.alt = name.charAt(0).toUpperCase();
  }

  // ── Profile page ──────────────────────────────────────────────────────────────
  var pName = document.getElementById("profile-name");
  var pRole = document.getElementById("profile-role");
  var pBio = document.getElementById("profile-bio");
  var pAv = document.getElementById("profile-avatar");
  if (pName)
    pName.innerHTML = name + ' <span class="verified-dot large"></span>';
  if (pRole) pRole.textContent = role + (hospital ? " | " + hospital : "");
  if (pBio && bio) pBio.textContent = bio;
  if (pAv) {
    pAv.src = avatarLg;
    pAv.alt = name.charAt(0).toUpperCase();
  }

  // ── Settings avatar ───────────────────────────────────────────────────────────
  var sAvImg = document.getElementById("settings-avatar-img");
  if (sAvImg) {
    sAvImg.src = avatarLg;
    sAvImg.alt = name.charAt(0).toUpperCase();
  }

  // ── Settings fields ───────────────────────────────────────────────────────────
  function setField(id, val) {
    var el = document.getElementById(id);
    if (!el || !val) return;
    if (el.tagName === "TEXTAREA") el.textContent = val;
    else el.value = val;
  }
  setField("sf-name", name);
  setField(
    "sf-username",
    name
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9.]/g, ""),
  );
  setField("sf-email", email);
  setField("sf-hospital", hospital);
  setField("sf-bio", bio);
  setField("sf-member-since", created);

  // Specialty dropdown
  var sfSpec = document.getElementById("sf-specialty");
  if (sfSpec && role) {
    for (var i = 0; i < sfSpec.options.length; i++) {
      if (sfSpec.options[i].value === role || sfSpec.options[i].text === role) {
        sfSpec.selectedIndex = i;
        break;
      }
    }
  }

  // Apply modal pre-fill
  var an = document.getElementById("apply-name");
  var ae = document.getElementById("apply-email");
  if (an && !an.value) an.value = name;
  if (ae && !ae.value) ae.value = email;
}

// ── Publish Post ──────────────────────────────────────────────────────────────
window.publishPost = async function () {
  var content = (document.getElementById("post-content") || {}).value || "";
  content = content.trim();
  var mediaInput = document.getElementById("media-input");
  var mediaFile =
    (mediaInput && mediaInput.files && mediaInput.files[0]) || null;

  if (!content && !mediaFile) {
    showToast("✍️ Please write something or attach media!");
    return;
  }

  var btn = document.querySelector(".publish-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Posting…";
  }

  try {
    var post = await huCreatePost({ content: content, mediaFile: mediaFile });
    if (!post) throw new Error("No response");

    showToast("✅ Post published successfully!");
    closeModal();

    var container = document.getElementById("feed-container");
    if (container)
      container.insertAdjacentHTML("afterbegin", buildPostCard(post));

    var pc = document.getElementById("post-content");
    if (pc) pc.value = "";
    if (mediaInput) mediaInput.value = "";
    var prev = document.getElementById("preview-container");
    if (prev) prev.innerHTML = "";
  } catch (err) {
    showToast("❌ " + (err.message || "Failed to publish"));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Post";
    }
  }
};

// ── Build Post Card (real posts, with working like / comment / share) ─────────
function buildPostCard(post) {
  var author = post.author || {};
  var name = author.name || "You";
  var avatarSrc = getLetterAvatar(name, 80);
  var verified = author.verified ? '<span class="verified-dot"></span>' : "";
  var mediaHtml = "";

  if (post.media_url) {
    var fullUrl = post.media_url.startsWith("http")
      ? post.media_url
      : HU_API + post.media_url;
    mediaHtml =
      post.media_type === "video"
        ? '<video src="' +
          fullUrl +
          '" controls style="width:100%;border-radius:12px;margin-top:10px;"></video>'
        : '<img src="' +
          fullUrl +
          '" style="width:100%;border-radius:12px;margin-top:10px;"/>';
  }

  var currentUser = huGetUser();
  var isOwner =
    currentUser &&
    (currentUser.id === author.id || currentUser.name === author.name);
  var deleteBtn = isOwner
    ? "<button onclick=\"deletePost('" +
      post.id +
      '\', this)" style="background:none;border:none;color:#e11d48;font-size:13px;cursor:pointer;margin-left:auto;">🗑️ Delete</button>'
    : "";

  var liked = !!post.liked_by_me;
  var likesCount = post.likes || 0;
  var commentsCount = post.comments_count || 0;
  var sharesCount = post.shares || 0;

  return (
    '<div class="post-card" data-post-id="' +
    post.id +
    '">' +
    '<div class="post-top">' +
    '<img src="' +
    avatarSrc +
    '" style="width:44px;height:44px;border-radius:50%;"/>' +
    '<div class="post-meta">' +
    '<div class="post-name">' +
    name +
    " " +
    verified +
    "</div>" +
    '<div class="post-role">' +
    (author.specialty || "Healthcare Professional") +
    " · " +
    timeAgo(post.created_at) +
    "</div>" +
    "</div>" +
    deleteBtn +
    "</div>" +
    '<div class="post-body"><p>' +
    (post.content || "") +
    "</p>" +
    mediaHtml +
    "</div>" +
    '<div class="post-actions">' +
    '<button class="action-btn real-like-btn' +
    (liked ? " liked" : "") +
    '" onclick="handleRealLike(\'' +
    post.id +
    "', this)\">" +
    "❤️ " +
    '<span class="real-like-count">' +
    likesCount +
    "</span>" +
    "</button>" +
    '<button class="action-btn real-comment-btn" onclick="toggleRealComments(\'' +
    post.id +
    "', this)\">" +
    "💬 " +
    '<span class="real-comment-count">' +
    commentsCount +
    "</span>" +
    "</button>" +
    '<button class="action-btn real-share-btn" onclick="handleRealShare(\'' +
    post.id +
    "', this)\">" +
    "🔁 " +
    '<span class="real-share-count">' +
    sharesCount +
    "</span>" +
    "</button>" +
    "</div>" +
    '<div class="real-comments-section" id="comments-' +
    post.id +
    '" style="display:none;padding:0 16px 14px;"></div>' +
    "</div>"
  );
}

// ── Real Like ──────────────────────────────────────────────────────────────────
async function handleRealLike(postId, btn) {
  var result = await huLikePost(postId);
  if (!result) return;
  btn.classList.toggle("liked", !!result.liked);
  var countEl = btn.querySelector(".real-like-count");
  if (countEl) countEl.textContent = result.likes;
}

// ── Real Share ─────────────────────────────────────────────────────────────────
async function handleRealShare(postId, btn) {
  var result = await huSharePost(postId);
  if (!result) return;
  var countEl = btn.querySelector(".real-share-count");
  if (countEl) countEl.textContent = result.shares;
  showToast("🔁 Post reshared to your profile!");
}

// ── Real Comments (open/close + list + add) ────────────────────────────────────
async function toggleRealComments(postId, btn) {
  var section = document.getElementById("comments-" + postId);
  if (!section) return;

  var isOpen = section.style.display !== "none";
  if (isOpen) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  section.innerHTML =
    '<p style="color:var(--muted-2,#94a3b8);font-size:13px;">Loading comments…</p>';

  var comments = await huGetComments(postId);
  var currentUser = huGetUser();
  var myAvatar = currentUser ? getLetterAvatar(currentUser.name, 60) : "";

  var listHtml = comments
    .map(function (c) {
      var a = c.author || {};
      return (
        '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
        '<img src="' +
        getLetterAvatar(a.name, 60) +
        '" style="width:28px;height:28px;border-radius:50%;flex-shrink:0;"/>' +
        '<div style="background:var(--bg,#f9fafb);border-radius:10px;padding:6px 10px;font-size:13.5px;">' +
        "<strong>" +
        (a.name || "Unknown") +
        "</strong><br/>" +
        c.content +
        "</div></div>"
      );
    })
    .join("");

  section.innerHTML =
    '<div class="real-comments-list">' +
    (listHtml ||
      '<p style="color:var(--muted-2,#94a3b8);font-size:13px;">No comments yet. Be the first!</p>') +
    "</div>" +
    '<div style="display:flex;gap:8px;margin-top:8px;">' +
    '<img src="' +
    myAvatar +
    '" style="width:28px;height:28px;border-radius:50%;flex-shrink:0;"/>' +
    '<input type="text" placeholder="Write a comment…" class="real-comment-input" ' +
    'style="flex:1;padding:8px 12px;border:1px solid var(--border,#e5e7eb);border-radius:20px;font-size:13.5px;outline:none;" ' +
    "onkeydown=\"if(event.key==='Enter'){submitRealComment('" +
    postId +
    "')}\"/>" +
    "<button onclick=\"submitRealComment('" +
    postId +
    '\')" style="background:none;border:none;color:var(--green,#377dff);font-weight:600;cursor:pointer;">Post</button>' +
    "</div>";
}

async function submitRealComment(postId) {
  var section = document.getElementById("comments-" + postId);
  if (!section) return;
  var input = section.querySelector(".real-comment-input");
  var content = (input.value || "").trim();
  if (!content) return;

  try {
    await huAddComment(postId, content);
    input.value = "";
    // Bump the visible counter on the post card and refresh the thread
    var card = document.querySelector(
      '.post-card[data-post-id="' + postId + '"]',
    );
    if (card) {
      var countEl = card.querySelector(".real-comment-count");
      if (countEl)
        countEl.textContent = (parseInt(countEl.textContent, 10) || 0) + 1;
    }
    section.style.display = "none";
    toggleRealComments(postId);
  } catch (err) {
    showToast("❌ " + (err.message || "Could not post comment"));
  }
}

async function deletePost(postId, btn) {
  if (!confirm("Delete this post?")) return;
  try {
    var res = await huFetch("/api/posts/" + postId, { method: "DELETE" });
    if (!res || !res.ok) {
      showToast("❌ Could not delete post");
      return;
    }
    // Remove post card from DOM
    var card = btn.closest(".post-card");
    if (card) card.remove();
    showToast("🗑️ Post deleted!");
  } catch (e) {
    showToast("❌ Error deleting post");
  }
}

// ── Patch logout ──────────────────────────────────────────────────────────────
window.confirmLogout = function () {
  var m = document.getElementById("logout-modal");
  if (m) m.classList.add("open");
};

// ── ADS ENGINE ────────────────────────────────────────────────────────────────
async function huCreateCampaign(opts) {
  var fd = new FormData();
  fd.append("name", opts.name || "");
  fd.append("objective", opts.objective || "awareness");
  fd.append("budget", opts.budget || 0);
  fd.append("bid_amount", opts.bidAmount || 2.0);
  fd.append("target_specialty", opts.targetSpecialty || "All");
  fd.append("target_location", opts.targetLocation || "All");
  if (opts.endDate) fd.append("end_date", opts.endDate);
  fd.append("headline", opts.headline || "");
  fd.append("body_text", opts.bodyText || "");
  fd.append("cta_text", opts.ctaText || "Learn More");
  fd.append("cta_link", opts.ctaLink || "");
  if (opts.imageFile) fd.append("image", opts.imageFile);

  var res = await huFetch("/api/ads/campaigns", { method: "POST", body: fd });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create campaign");
  return data;
}

async function huGetMyCampaigns() {
  var res = await huFetch("/api/ads/campaigns/mine");
  if (!res || !res.ok) return [];
  return await res.json();
}

async function huSetCampaignStatus(campaignId, status) {
  var res = await huFetch("/api/ads/campaigns/" + campaignId + "/status", {
    method: "PUT",
    body: JSON.stringify({ status: status }),
  });
  if (!res) return null;
  return await res.json();
}

async function huDeleteCampaign(campaignId) {
  var res = await huFetch("/api/ads/campaigns/" + campaignId, {
    method: "DELETE",
  });
  if (!res) return null;
  return await res.json();
}

async function huServeAd() {
  var res = await huFetch("/api/ads/serve");
  if (!res || !res.ok) return null;
  return await res.json();
}

async function huLogAdImpression(campaignId, creativeId) {
  try {
    await huFetch("/api/ads/impression", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: campaignId,
        creative_id: creativeId,
      }),
    });
  } catch (e) {}
}

async function huLogAdClick(campaignId, creativeId) {
  try {
    var res = await huFetch("/api/ads/click", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: campaignId,
        creative_id: creativeId,
      }),
    });
    if (res && res.ok) {
      var data = await res.json();
      if (data.hu_coins !== undefined) huUpdateUserCoins(data.hu_coins);
    }
  } catch (e) {}
}

// ── User Coin Sync Helper ──────────────────────────────────────────────────────
function huUpdateUserCoins(newCoins) {
  var u = huGetUser();
  if (u) {
    u.hu_coins = newCoins;
    u.coins = newCoins;
    localStorage.setItem("hu_user", JSON.stringify(u));
    applyUserToUI();
  }
}

// ── E-Commerce & Store APIs ───────────────────────────────────────────────────
async function huGetCart() {
  var res = await huFetch("/api/cart");
  if (!res || !res.ok) return { items: [], total: 0 };
  var data = await res.json();
  if (data.hu_coins_balance !== undefined) huUpdateUserCoins(data.hu_coins_balance);
  return data;
}

async function huAddToCart(productId, quantity) {
  quantity = quantity || 1;
  var res = await huFetch("/api/cart/add", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: quantity }),
  });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to add to cart");
  return data;
}

async function huRemoveFromCart(productId) {
  var res = await huFetch("/api/cart/remove", {
    method: "DELETE",
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res) return null;
  return await res.json();
}

async function huCheckout(opts) {
  opts = opts || {};
  var res = await huFetch("/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      address: opts.address || "Standard Address",
      use_coins: opts.use_coins !== false,
    }),
  });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Checkout failed");
  if (data.new_hu_coins !== undefined) huUpdateUserCoins(data.new_hu_coins);
  return data;
}

async function huGetMyOrders() {
  var res = await huFetch("/api/orders/mine");
  if (!res || !res.ok) return [];
  var data = await res.json();
  return data.orders || [];
}

async function huCancelOrder(orderId) {
  var res = await huFetch("/api/orders/" + orderId + "/cancel", {
    method: "POST",
  });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Cancellation failed");
  if (data.new_hu_coins !== undefined) huUpdateUserCoins(data.new_hu_coins);
  return data;
}

// ── LinkedIn-Style Professional Network APIs ──────────────────────────────────
async function huSendConnectionRequest(receiverId) {
  var res = await huFetch("/api/connections/request", {
    method: "POST",
    body: JSON.stringify({ receiver_id: receiverId }),
  });
  if (!res || !res.ok) return { message: "Connection request sent!" };
  var data = await res.json();
  return data;
}

async function huAcceptConnection(connId) {
  var res = await huFetch("/api/connections/" + connId + "/accept", {
    method: "POST",
  });
  if (!res || !res.ok) return { message: "Connection accepted!" };
  var data = await res.json();
  if (data.new_hu_coins !== undefined) huUpdateUserCoins(data.new_hu_coins);
  return data;
}

async function huGetMyConnections() {
  var res = await huFetch("/api/connections/mine");
  if (!res || !res.ok) return { connections: [], pending_requests: [] };
  return await res.json();
}

async function huGetConnectionSuggestions() {
  var res = await huFetch("/api/connections/suggestions");
  if (!res || !res.ok) return [];
  var data = await res.json();
  return data.suggestions || [];
}

async function huEndorseSkill(recipientId, skillName) {
  var res = await huFetch("/api/skills/endorse", {
    method: "POST",
    body: JSON.stringify({ recipient_id: recipientId, skill_name: skillName }),
  });
  if (!res || !res.ok) return { message: "Endorsed skill!" };
  var data = await res.json();
  return data;
}

async function huGetUserSkills(userId) {
  var res = await fetch(HU_API + "/api/skills/" + userId);
  if (!res || !res.ok) return [];
  var data = await res.json();
  return data.skills || [];
}

async function huReactToPost(postId, reactionType) {
  reactionType = reactionType || "like";
  var res = await huFetch("/api/posts/" + postId + "/react", {
    method: "POST",
    body: JSON.stringify({ reaction_type: reactionType }),
  });
  if (!res || !res.ok) return null;
  return await res.json();
}

// ── Explore Hub & Discovery APIs ──────────────────────────────────────────────
async function huGetExploreHub() {
  var res = await huFetch("/api/explore/hub");
  if (!res || !res.ok) {
    // Fallback if unauthenticated / server offline
    var r = await fetch(HU_API + "/api/explore/hub");
    if (!r || !r.ok) return null;
    return await r.json();
  }
  return await res.json();
}

async function huGetMutualConnections(targetUserId) {
  var res = await huFetch("/api/connections/mutual/" + targetUserId);
  if (!res || !res.ok) return { mutual_connections: [], count: 0 };
  return await res.json();
}

async function huSearchAdvanced(query, searchType) {
  searchType = searchType || "all";
  var res = await fetch(HU_API + "/api/search/advanced?q=" + encodeURIComponent(query) + "&type=" + searchType);
  if (!res || !res.ok) return { results: {} };
  return await res.json();
}

async function huAttendEvent(eventId) {
  var res = await huFetch("/api/events/" + eventId + "/attend", {
    method: "POST",
  });
  if (!res) return null;
  var data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  if (data.new_hu_coins !== undefined) huUpdateUserCoins(data.new_hu_coins);
  return data;
}

async function huGetProductDetails(productId) {
  var res = await fetch(HU_API + "/api/products/" + productId);
  if (!res || !res.ok) return null;
  return await res.json();
}

async function huUpdateCartQty(productId, quantity) {
  var res = await huFetch("/api/cart/update", {
    method: "PUT",
    body: JSON.stringify({ product_id: productId, quantity: quantity })
  });
  if (!res || !res.ok) return null;
  return await res.json();
}

async function huGetWishlist() {
  var res = await huFetch("/api/wishlist");
  if (!res || !res.ok) return [];
  var data = await res.json();
  return data.wishlist || [];
}

async function huToggleWishlist(productId) {
  var res = await huFetch("/api/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ product_id: productId })
  });
  if (!res || !res.ok) return null;
  return await res.json();
}

async function huGetOrderDetails(orderId) {
  var res = await huFetch("/api/orders/" + orderId);
  if (!res || !res.ok) return null;
  var data = await res.json();
  return data.order || null;
}

async function huGetRewardsSummary() {
  var res = await huFetch("/api/rewards/summary");
  if (!res || !res.ok) return null;
  return await res.json();
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  applyUserToUI();
});

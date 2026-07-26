// ─── api.js — Healthy Universe ───────────────────────────────────────────────
//const HU_API = "http://localhost:8000";
const HU_API = "https://healthy-universe.onrender.com";

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

// ── Auth Guard ────────────────────────────────────────────────────────────────
(function huAuthGuard() {
  if (!huGetToken()) window.location.href = "auth.html";
})();

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
    huLogout();
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
// async function huCreatePost(opts) {
//   var fd = new FormData();
//   fd.append("content", opts.content || "");
//   // if (post.media_url) {
//   //   var fullUrl = HU_API + post.media_url;
//   if (post.media_url) {
//     var fullUrl = post.media_url.startsWith('http') ? post.media_url : (HU_API + post.media_url);
//   fd.append("category", opts.category || "General Wellness");
//   if (opts.mediaFile) fd.append("media", opts.mediaFile);
//   var res = await huFetch("/api/posts/create", { method: "POST", body: fd });
//   if (!res) return null;
//   var data = await res.json();
//   if (!res.ok) throw new Error(data.detail || "Failed to create post");
//   return data;
// }

// ── Fetch Feed ────────────────────────────────────────────────────────────────
async function huGetFeed(limit, offset) {
  limit = limit || 20;
  offset = offset || 0;
  try {
    var res = await fetch(
      HU_API + "/api/posts?limit=" + limit + "&offset=" + offset,
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

// ── Like Post ─────────────────────────────────────────────────────────────────
async function huLikePost(postId) {
  var res = await huFetch("/api/posts/" + postId + "/like", { method: "POST" });
  if (!res || !res.ok) return null;
  return await res.json();
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
  ["rp-coins", "wallet-coins", "rev-coins"].forEach(function (id) {
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

// ── Build Post Card ───────────────────────────────────────────────────────────
// function buildPostCard(post) {
//   var author = post.author || {};
//   var name = author.name || "You";
//   var avatarSrc = getLetterAvatar(name, 80);
//   var verified = author.verified ? '<span class="verified-dot"></span>' : "";
//   var mediaHtml = "";

//   if (post.media_url) {
//     var fullUrl = HU_API + post.media_url;
//     mediaHtml =
//       post.media_type === "video"
//         ? '<video src="' +
//           fullUrl +
//           '" controls style="width:100%;border-radius:12px;margin-top:10px;"></video>'
//         : '<img src="' +
//           fullUrl +
//           '" style="width:100%;border-radius:12px;margin-top:10px;"/>';
//   }

//   // ── Check if current user is the author ──
//   var currentUser = huGetUser();
//   var isOwner =
//     currentUser &&
//     (currentUser.id === author.id || currentUser.name === author.name);
//   var deleteBtn = isOwner
//     ? "<button onclick=\"deletePost('" +
//       post.id +
//       '\', this)" style="background:none;border:none;color:#e11d48;font-size:13px;cursor:pointer;margin-left:auto;">🗑️ Delete</button>'
//     : "";

//   return (
//     '<div class="post-card" data-post-id="' +
//     post.id +
//     '">' +
//     '<div class="post-top">' +
//     '<img src="' +
//     avatarSrc +
//     '" style="width:44px;height:44px;border-radius:50%;"/>' +
//     '<div class="post-meta">' +
//     '<div class="post-name">' +
//     name +
//     " " +
//     verified +
//     "</div>" +
//     '<div class="post-role">' +
//     (author.specialty || "Healthcare Professional") +
//     " · Just now</div>" +
//     "</div>" +
//     deleteBtn +
//     "</div>" +
//     '<div class="post-body"><p>' +
//     (post.content || "") +
//     "</p>" +
//     mediaHtml +
//     "</div>" +
//     "</div>"
//   );
// }
// // function buildPostCard(post) {
// //   var author = post.author || {};
// //   var name = author.name || "You";
// //   var avatarSrc = getLetterAvatar(name, 80);
// //   var verified = author.verified ? '<span class="verified-dot"></span>' : "";
// //   var mediaHtml = "";

// //   if (post.media_url) {
// //     var fullUrl = HU_API + post.media_url;
// //     mediaHtml =
// //       post.media_type === "video"
// //         ? '<video src="' +
// //           fullUrl +
// //           '" controls style="width:100%;border-radius:12px;margin-top:10px;"></video>'
// //         : '<img src="' +
// //           fullUrl +
// //           '" style="width:100%;border-radius:12px;margin-top:10px;"/>';
// //   }

// //   return (
// //     '<div class="post-card" data-post-id="' +
// //     post.id +
// //     '">' +
// //     '<div class="post-top">' +
// //     '<img src="' +
// //     avatarSrc +
// //     '" style="width:44px;height:44px;border-radius:50%;"/>' +
// //     '<div class="post-meta">' +
// //     '<div class="post-name">' +
// //     name +
// //     " " +
// //     verified +
// //     "</div>" +
// //     '<div class="post-role">' +
// //     (author.specialty || "Healthcare Professional") +
// //     " · Just now</div>" +
// //     "</div>" +
// //     "</div>" +
// //     '<div class="post-body"><p>' +
// //     (post.content || "") +
// //     "</p>" +
// //     mediaHtml +
// //     "</div>" +
// //     '<div class="post-actions">' +
// //     '<button class="action-btn" onclick="huLikePost(\'' +
// //     post.id +
// //     "').then(function(r){if(r)this.querySelector('.action-count').textContent=r.likes}.bind(this))\">" +
// //     '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
// //     '<span class="action-count">0</span>' +
// //     "</button>" +
// //     "</div>" +
// //     "</div>"
// //   );
// // }
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
    "</div>"
  );
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
  var res = await huFetch("/api/ads/campaigns/" + campaignId, { method: "DELETE" });
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
      body: JSON.stringify({ campaign_id: campaignId, creative_id: creativeId }),
    });
  } catch (e) {}
}

async function huLogAdClick(campaignId, creativeId) {
  try {
    await huFetch("/api/ads/click", {
      method: "POST",
      body: JSON.stringify({ campaign_id: campaignId, creative_id: creativeId }),
    });
  } catch (e) {}
}
// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  applyUserToUI();
});

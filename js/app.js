/* ============================================
   HEALTHY UNIVERSE - APP LOGIC
   js/app.js
   ============================================ */

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toLocaleString();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function navigate(pageId, clickedBtn) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const target = document.getElementById("page-" + pageId);
  if (target) target.classList.add("active");
  document
    .querySelectorAll(".nav-link")
    .forEach((n) => n.classList.remove("active"));
  if (clickedBtn) clickedBtn.classList.add("active");
  if (pageId === "explore") renderCreators();
  if (pageId === "consultations") renderDoctors();
  if (pageId === "jobs") renderJobs();
  if (pageId === "ads") renderAdsManager();
  // if (pageId === "games") {
  //   if (typeof loadNextArcadeQuestion === "function") {
  //     loadNextArcadeQuestion();
  //   }
  // }

}

// function renderFeed(posts) {
//   const container = document.getElementById("feed-container");
//   if (!container) return;
//   const data = posts || POSTS;
//   container.innerHTML = data.map((post) => `
//     <article class="post-card" id="post-${post.id}">
//       <div class="post-top">
//         <img src="${post.avatar}" alt="${post.name}" loading="lazy"/>
//         <div class="post-meta">
//           <div class="post-name">${post.name}<span class="verified-dot"></span></div>
//           <div class="post-role">${post.role} · ${post.time}</div>
//         </div>
//         <button class="post-more">···</button>
//       </div>
//       <div class="post-body">
//         <div class="post-title">${post.title}</div>
//         <div class="post-text">${post.text}</div>
//       </div>
//       <div class="post-image-wrap">
//         <img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy"/>
//         ${post.trusted ? `<div class="trusted-badge"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Trusted Content</div>` : ""}
//       </div>
//       <div style="padding:10px 16px 0;display:flex;align-items:center;">
//         <button class="revenue-badge" id="rev-${post.id}" onclick="claimRevenue(${post.id}, this)">
//           💰 $${post.earnings ? post.earnings.toFixed(2) : "0.00"} earned today — Claim
//         </button>
//       </div>
//       <div class="post-actions">
//         <button class="action-btn ${post.liked ? "liked" : ""}" onclick="toggleLike(${post.id}, this)">
//           <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
//           <span class="like-count">${formatNum(post.likes)}</span>
//         </button>
//         <button class="action-btn" onclick="this.style.color='#2563eb'">
//           <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
//           ${post.comments}
//         </button>
//         <button class="action-btn" onclick="this.style.color='#7c3aed'">
//           <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
//           ${post.shares}
//         </button>
//         <div class="action-spacer"></div>
//         <button class="action-btn ${post.saved ? "saved" : ""}" onclick="toggleSave(${post.id}, this)">
//           <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
//         </button>
//       </div>
//       <div class="post-footer">
//         <div class="post-tags">${post.tags.map((t) => `<span class="post-tag">${t}</span>`).join("")}</div>
//         <span class="view-count">${post.views} views</span>
//       </div>
//     </article>
//   `).join("");
// }
function renderFeed(posts) {
  const container = document.getElementById("feed-container");
  if (!container) return;

  const data = posts || POSTS;

  container.innerHTML = data
    .map(
      (post) => `

    <article class="post-card" id="post-${post.id}">

      <!-- TOP -->
      <div class="post-top">
        <img src="${post.avatar}" alt="${post.name}" loading="lazy"/>
        <div class="post-meta">
          <div class="post-name">
            ${post.name}<span class="verified-dot"></span>
          </div>
          <div class="post-role">${post.role} · ${post.time}</div>
        </div>
        <button class="post-more">···</button>
      </div>

      <!-- TEXT -->
      <div class="post-body">
        <div class="post-title">${post.title}</div>
        <div class="post-text">${post.text}</div>
      </div>

      <!-- MEDIA SECTION -->
      <div class="post-image-wrap">

        ${
          // 🔥 NEW POSTS (video)
          post.type === "video" && post.media
            ? `
              <video class="post-image" controls>
                <source src="${post.media}" type="video/mp4">
              </video>
            `
            : // 🔥 NEW POSTS (image uploaded)
              post.media
              ? `<img src="${post.media}" class="post-image" loading="lazy"/>`
              : // ✅ OLD POSTS (existing image — DO NOT REMOVE)
                post.image
                ? `<img src="${post.image}" class="post-image" loading="lazy"/>`
                : // nothing
                  ""
        }

        ${
          post.trusted
            ? `<div class="trusted-badge">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Trusted Content
              </div>`
            : ""
        }

      </div>

      <!-- REVENUE -->
      <div style="padding:10px 16px 0;display:flex;align-items:center;">
        <button class="revenue-badge" id="rev-${post.id}" onclick="claimRevenue(${post.id}, this)">
          💰 $${post.earnings ? post.earnings.toFixed(2) : "0.00"} earned today — Claim
        </button>
      </div>

      <!-- ACTIONS -->
      <div class="post-actions">

        <button class="action-btn ${post.liked ? "liked" : ""}" onclick="toggleLike(${post.id}, this)">
          ❤️ <span class="like-count">${formatNum(post.likes)}</span>
        </button>

        <button class="action-btn">${post.comments}</button>

        <button class="action-btn">${post.shares}</button>

        <div class="action-spacer"></div>

        <button class="action-btn ${post.saved ? "saved" : ""}" onclick="toggleSave(${post.id}, this)">
          🔖
        </button>

      </div>

      <!-- FOOTER -->
      <div class="post-footer">
        <div class="post-tags">
          ${(post.tags || []).map((t) => `<span class="post-tag">${t}</span>`).join("")}
        </div>
        <span class="view-count">${post.views || 0} views</span>
      </div>

    </article>

  `,
    )
    .join("");
}

function toggleLike(postId, btn) {
  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  btn.classList.toggle("liked", post.liked);
  btn.querySelector(".like-count").textContent = formatNum(post.likes);
}

function toggleSave(postId, btn) {
  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;
  post.saved = !post.saved;
  btn.classList.toggle("saved", post.saved);
  showToast(post.saved ? "✓ Post saved!" : "Post removed from saved");
}

const ICONS = {
  heart: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  comment: `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  follow: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  share: `<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
};

function renderNotifications() {
  const list = document.getElementById("notif-list");
  if (!list) return;
  list.innerHTML = NOTIFICATIONS.map(
    (n) => `
    <div class="notif-row ${n.unread ? "unread" : ""}" id="notif-${n.id}" onclick="readNotif(${n.id})">
      <img src="${n.avatar}" alt="${n.name}" loading="lazy"/>
      <div class="notif-body">
        <p><strong>${n.name}</strong> ${n.action}</p>
        ${n.quote ? `<div class="notif-quote">${n.quote}</div>` : ""}
        <span class="notif-time">${n.time}</span>
      </div>
      <div class="notif-icon ni-${n.iconType === "heart" ? "heart" : n.iconType === "comment" ? "comment" : n.iconType === "share" ? "share" : "follow"}">
        ${ICONS[n.iconType]}
      </div>
    </div>
  `,
  ).join("");
}

function readNotif(id) {
  const notif = NOTIFICATIONS.find((n) => n.id === id);
  if (notif) notif.unread = false;
  const el = document.getElementById("notif-" + id);
  if (el) el.classList.remove("unread");
}

function markAllRead() {
  NOTIFICATIONS.forEach((n) => (n.unread = false));
  document
    .querySelectorAll(".notif-row.unread")
    .forEach((el) => el.classList.remove("unread"));
  showToast("✓ All notifications marked as read");
}

function setFilter(btn) {
  document
    .querySelectorAll(".filter-tab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function selectTopic(card) {
  document
    .querySelectorAll(".topic-card")
    .forEach((c) => c.classList.remove("active"));
  card.classList.add("active");
}

function toggleFollow(btn) {
  const isFollowing = btn.classList.contains("following");
  if (isFollowing) {
    btn.classList.remove("following");
    btn.textContent = "Follow";
  } else {
    btn.classList.add("following");
    btn.textContent = "✓ Following";
    showToast("✓ Now following!");
  }
}

function setProfileTab(btn) {
  document
    .querySelectorAll(".profile-tab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function setViewToggle(btn) {
  document
    .querySelectorAll(".view-toggle")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function openModal() {
  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

function selectChip(btn) {
  document
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
}

// function publishPost() {
//   const content = document.getElementById("post-content");
//   if (!content.value.trim()) {
//     content.style.borderColor = "#e11d48";
//     content.focus();
//     setTimeout(() => (content.style.borderColor = ""), 2000);
//     return;
//   }
//   closeModal();
//   content.value = "";
//   document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
//   const toggle = document.getElementById("med-edu-toggle");
//   if (toggle) toggle.classList.remove("on");
//   showToast("🎉 Post published successfully!");
// }
let selectedFile = null;

function previewMedia(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile = file;

  const preview = document.getElementById("preview-container");
  preview.innerHTML = "";

  const url = URL.createObjectURL(file);

  if (file.type.startsWith("video")) {
    preview.innerHTML = `<video src="${url}" controls width="100%"></video>`;
  } else {
    preview.innerHTML = `<img src="${url}" width="100%">`;
  }
}
// function publishPost() {
//   const content = document.getElementById("post-content");

//   if (!content.value.trim()) return;

//   const newPost = {
//     id: Date.now(),
//     name: "Dr. Michael Chen",
//     avatar:
//       "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face",
//     role: "Healthcare Professional",
//     time: "Just now",
//     title: "User Post",
//     text: content.value,
//     image: uploadedMediaType === "image" ? uploadedMediaURL : "",
//     video: uploadedMediaType === "video" ? uploadedMediaURL : "",
//     likes: 0,
//     comments: 0,
//     shares: 0,
//     views: 0,
//     liked: false,
//     saved: false,
//     earnings: 0,
//     tags: ["User Post"],
//     trusted: false,
//   };

//   POSTS.unshift(newPost);
//   renderFeed();

//   // reset
//   uploadedMediaURL = "";
//   uploadedMediaType = "";
//   document.getElementById("media-preview").innerHTML = "";

//   closeModal();
//   content.value = "";

//   showToast("🎉 Post published!");
// }
// let uploadedFile = null;
// let uploadedType = null; // "image" or "video"
// function handleFileUpload(event) {
//   const file = event.target.files[0];
//   if (!file) return;

//   uploadedFile = URL.createObjectURL(file);
//   uploadedType = file.type.startsWith("video") ? "video" : "image";

//   const preview = document.getElementById("preview-container");

//   if (uploadedType === "image") {
//     preview.innerHTML = `<img src="${uploadedFile}" style="width:100%;border-radius:10px;">`;
//   } else {
//     preview.innerHTML = `
//       <video controls style="width:100%;border-radius:10px;">
//         <source src="${uploadedFile}" type="${file.type}">
//       </video>
//     `;
//   }
// }

let uploadedMedia = "";
let mediaType = "image";

// HANDLE FILE SELECTION
document.getElementById("media-input").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    uploadedMedia = event.target.result;

    if (file.type.startsWith("video")) {
      mediaType = "video";
    } else {
      mediaType = "image";
    }
  };

  reader.readAsDataURL(file);
});

// // PUBLISH POST
// function publishPost() {
//   const text = document.getElementById("post-content").value;

//   if (!text && !uploadedMedia) {
//     alert("Add content or media!");
//     return;
//   }

//   const newPost = {
//     id: Date.now(),
//     name: "Dr. Michael Chen",
//     avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80",
//     role: "Healthcare Professional",
//     time: "Just now",
//     title: "New Medical Post",
//     text: text,
//     media: uploadedMedia,
//     type: mediaType,
//     trusted: false,
//     likes: 0,
//     comments: 0,
//     shares: 0,
//     views: 0,
//     tags: ["New"],
//     liked: false,
//     saved: false,
//   };

//   // IMPORTANT: add to top
//   POSTS.unshift(newPost);

//   // RE-RENDER
//   renderFeed();

//   // RESET
//   document.getElementById("post-content").value = "";
//   uploadedMedia = "";

//   closeModal();
// }
// PUBLISH POST - handled by api.js (saves to database)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeBookingModal();
    closeApplyModal();
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   applyStoredTheme();
//   renderFeed();
//   renderNotifications();
//   renderProfileGrid();
//   renderSuggestedUsers();
// });
document.addEventListener("DOMContentLoaded", async () => {
  applyStoredTheme();

  // Render fake posts first
  renderFeed();
  renderNotifications();
  renderProfileGrid();
  renderSuggestedUsers();
  calculateHealthScore();

  // Load real posts from database and show on top
  try {
    const realPosts = await huGetFeed(20, 0);
    if (realPosts && realPosts.length > 0) {
      const container = document.getElementById("feed-container");
      realPosts.forEach((post) => {
        container.insertAdjacentHTML("afterbegin", buildPostCard(post));
      });
    }
  } catch (e) { }
  injectSponsoredAd();
});

/* Feed Tabs */
function switchFeedTab(tab, btn) {
  document
    .querySelectorAll(".feed-tab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  if (tab === "trending")
    renderFeed([...POSTS].sort((a, b) => b.likes - a.likes));
  else if (tab === "following") {
    renderFeed([POSTS[0], POSTS[3]]);
    showToast("Showing posts from people you follow");
  } else renderFeed();
}

/* Revenue Badge */
function claimRevenue(postId, btn) {
  if (btn.classList.contains("claimed")) return;
  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;
  btn.classList.add("claimed");
  btn.textContent = "✓ Claimed!";
  const bal =
    parseFloat(document.getElementById("user-balance").textContent) +
    (post.earnings || 0);
  document.getElementById("user-balance").textContent = bal.toFixed(2);
  const mob = document.getElementById("mobile-user-balance");
  if (mob) mob.textContent = bal.toFixed(2);
  showToast(`💰 $${post.earnings.toFixed(2)} added to your Health Balance!`);
}

/* Creators Grid */
function renderCreators() {
  const grid = document.getElementById("creators-grid");
  if (!grid || typeof CREATORS === "undefined") return;
  grid.innerHTML = CREATORS.map(
    (c) => `
    <div class="creator-card">
      <img src="${c.avatar}" alt="${c.name}" loading="lazy"/>
      <h3>${c.name}${c.verified ? '<span class="verified-dot"></span>' : ""}</h3>
      <div class="creator-role">${c.role}</div>
      <div class="creator-followers">${c.followers}</div>
      <button class="follow-btn" onclick="toggleFollow(this)">Follow</button>
    </div>
  `,
  ).join("");
}

/* Profile Grid */
function renderProfileGrid() {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;
  grid.innerHTML = POSTS.map(
    (p) => `
    <div class="grid-post">
      <img src="${p.image}" alt="${p.title}" loading="lazy" onclick="showToast('📄 Opening post...')"/>
    </div>
  `,
  ).join("");
}

/* Right Panel — Suggested Users */
function renderSuggestedUsers() {
  const list = document.getElementById("rp-suggested-list");
  if (!list || typeof SUGGESTED_USERS === "undefined") return;
  list.innerHTML = SUGGESTED_USERS.map(
    (u) => `
    <div class="rp-suggested-row">
      <img src="${u.avatar}" alt="${u.name}" loading="lazy"/>
      <div>
        <div class="rp-sug-name">${u.name}${u.verified ? '<span class="verified-dot"></span>' : ""}</div>
        <div class="rp-sug-role">${u.role}</div>
      </div>
      <button class="rp-follow-btn" onclick="rpToggleFollow(this)">Follow</button>
    </div>
  `,
  ).join("");
}

function rpToggleFollow(btn) {
  const isFollowing = btn.classList.contains("following");
  if (isFollowing) {
    btn.classList.remove("following");
    btn.textContent = "Follow";
  } else {
    btn.classList.add("following");
    btn.textContent = "✓";
    showToast("✓ Now following!");
  }
}

/* ============================================
   CONSULTATION LOGIC
   ============================================ */
const BookingState = {
  doctor: null,
  type: "video",
  date: null,
  dateLabel: null,
  time: null,
  payment: "coins",
};

function renderDoctors(list) {
  const grid = document.getElementById("doctors-grid");
  if (!grid) return;
  const data = list || DOCTORS;
  if (!data || data.length === 0) {
    grid.innerHTML =
      '<div class="no-doctors-msg"><h3>No doctors found</h3><p>Try adjusting your search or specialty filter</p></div>';
    return;
  }
  const myUser = huGetUser();
  const myId = myUser ? String(myUser.id) : null;
  grid.innerHTML = data
    .map((doc, idx) => {
      const canDelete = doc.addedBy && myId && String(doc.addedBy) === myId;
      return `
    <div class="doctor-card" style="animation-delay:${idx * 0.05}s">
      ${canDelete ? `<button class="doc-delete-btn" onclick="deleteMyDoctor('${doc.id}', event)">🗑 Remove</button>` : ""}
      <div class="doc-card-top">
        <div class="doc-avatar-wrap">
          <img src="${doc.avatar}" alt="${doc.name}" class="doc-avatar" loading="lazy"/>
          <span class="doc-online-dot ${doc.status}"></span>
          ${doc.experience >= 10 ? `<span class="doc-exp-badge">${doc.experience}yr</span>` : ""}
        </div>
        <div class="doc-card-info">
          <div class="doc-name">${doc.name}${doc.verified ? '<span class="verified-dot"></span>' : ""}</div>
          <div class="doc-specialty">${doc.specialty}</div>
          <div class="doc-hospital">🏥 ${doc.hospital}</div>
          <div class="doc-rating"><span class="stars">★★★★${doc.rating >= 4.8 ? "★" : "☆"}</span>${doc.rating}<small>(${doc.reviews})</small></div>
        </div>
      </div>
      <div class="doc-tags">${doc.tags.map((t) => `<span class="doc-tag">${t}</span>`).join("")}</div>
      <div class="doc-meta-row">
        <div class="doc-meta-item">🩺 <strong>${formatNum(doc.consultations)}</strong> consults</div>
        <div class="doc-meta-item">⏱ <strong>${doc.experience} yrs</strong> exp</div>
        <span class="doc-status-badge ${doc.status}">${doc.status === "online" ? "● Online" : doc.status === "busy" ? "● In Session" : "○ Offline"}</span>
      </div>
      <div class="doc-price-row">
        <div><span class="doc-price-amount">₹${doc.price}</span><span class="doc-price-coins">or ${doc.coins} HU Coins</span></div>
        <button class="doc-book-btn" onclick="openBookingModal('${doc.id}')" ${doc.status === "offline" ? "disabled" : ""}>${doc.status === "offline" ? "Unavailable" : "Book Now"}</button>
      </div>
      <div class="doc-next-slot">🕐 Next: ${doc.nextSlot}</div>
    </div>
  `;
    })
    .join("");
  const c = document.getElementById("doc-count");
  if (c) c.textContent = data.length;
}

function openAddDoctorModal() {
  if (!huGetToken()) {
    showToast("⚠️ Please log in to add a doctor");
    return;
  }
  document.getElementById("add-doctor-form").reset();
  document.getElementById("add-doctor-modal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeAddDoctorModal() {
  document.getElementById("add-doctor-modal").style.display = "none";
  document.body.style.overflow = "";
}

// async function handleAddDoctorSubmit(event) {
//   event.preventDefault();
//   const name = document.getElementById("ud-doc-name").value.trim();
//   const specialty = document.getElementById("ud-doc-specialty").value;
//   if (!name) {
//     showToast("⚠️ Doctor name is required");
//     return;
//   }

//   const tags = document
//     .getElementById("ud-doc-tags")
//     .value.split(",")
//     .map((t) => t.trim())
//     .filter(Boolean);

//   const payload = {
//     name: name,
//     specialty: specialty,
//     hospital: document.getElementById("ud-doc-hospital").value.trim(),
//     avatar_url: document.getElementById("ud-doc-avatar").value.trim(),
//     experience:
//       parseInt(document.getElementById("ud-doc-experience").value) || 0,
//     price: parseFloat(document.getElementById("ud-doc-price").value) || 0,
//     tags: tags,
//     next_slot:
//       document.getElementById("ud-doc-nextslot").value.trim() ||
//       "Available Now",
//   };
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function handleAddDoctorSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("ud-doc-name").value.trim();
  const specialty = document.getElementById("ud-doc-specialty").value;
  if (!name) {
    showToast("⚠️ Doctor name is required");
    return;
  }

  const tags = document
    .getElementById("ud-doc-tags")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // Handle image upload from file input
  const fileInput = document.getElementById("ud-doc-avatar");
  let avatarUrl = "";

  if (fileInput && fileInput.files && fileInput.files[0]) {
    try {
      avatarUrl = await readFileAsBase64(fileInput.files[0]);
    } catch (err) {
      console.error("Error reading photo file:", err);
      showToast("⚠️ Failed to process image file");
      return;
    }
  }

  const payload = {
    name: name,
    specialty: specialty,
    hospital: document.getElementById("ud-doc-hospital").value.trim(),
    avatar_url: avatarUrl, // Contains the Base64 image string
    experience:
      parseInt(document.getElementById("ud-doc-experience").value) || 0,
    price: parseFloat(document.getElementById("ud-doc-price").value) || 0,
    tags: tags,
    next_slot:
      document.getElementById("ud-doc-nextslot").value.trim() ||
      "Available Now",
  };

  const btn = document.getElementById("ud-doc-submit-btn");
  btn.disabled = true;
  btn.textContent = "Adding…";

  try {
    const res = await huFetch("/api/doctors/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) {
      showToast("❌ " + (data.detail || "Could not add doctor"));
      return;
    }

    DOCTORS.push(data);
    renderDoctors();
    closeAddDoctorModal();
    showToast("✅ Doctor added successfully!");
  } catch (e) {
    showToast("❌ Could not connect to server");
  } finally {
    btn.disabled = false;
    btn.textContent = "Add Doctor";
  }
}

async function deleteMyDoctor(doctorId, event) {
  if (event) event.stopPropagation();
  if (!confirm("Remove this doctor you added? This cannot be undone.")) return;
  try {
    const res = await huFetch("/api/doctors/" + doctorId, { method: "DELETE" });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) {
      showToast("❌ " + (data.detail || "Could not remove doctor"));
      return;
    }
    DOCTORS = DOCTORS.filter((d) => d.id !== doctorId);
    renderDoctors();
    showToast("🗑️ Doctor removed");
  } catch (e) {
    showToast("❌ Could not connect to server");
  }
}

function filterDoctors(q) {
  const query = q.toLowerCase();
  renderDoctors(
    DOCTORS.filter(
      (d) =>
        !query ||
        d.name.toLowerCase().includes(query) ||
        d.specialty.toLowerCase().includes(query) ||
        d.tags.some((t) => t.toLowerCase().includes(query)),
    ),
  );
}

function filterBySpecialty(spec, btn) {
  document
    .querySelectorAll(".specialty-pill")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  renderDoctors(
    spec === "All"
      ? DOCTORS
      : DOCTORS.filter((d) => d.specialty.includes(spec)),
  );
}

function sortDoctors(by) {
  renderDoctors(
    [...DOCTORS].sort((a, b) =>
      by === "rating"
        ? b.rating - a.rating
        : by === "price_low"
          ? a.price - b.price
          : by === "price_high"
            ? b.price - a.price
            : b.experience - a.experience,
    ),
  );
}

function openBookingModal(docId) {
  const doc = DOCTORS.find((d) => d.id === docId);
  if (!doc) return;
  BookingState.doctor = doc;
  BookingState.type = "video";
  BookingState.date = null;
  BookingState.dateLabel = null;
  BookingState.time = null;
  BookingState.payment = "coins";
  document.getElementById("booking-step-1").style.display = "block";
  document.getElementById("booking-step-2").style.display = "none";
  document.getElementById("booking-doc-info").innerHTML = `
    <img src="${doc.avatar}" alt="${doc.name}"/>
    <div><strong>${doc.name}</strong><span>${doc.specialty} · ${doc.hospital}</span></div>
    <div class="booking-doc-price"><strong>₹${doc.price}</strong><span>★ ${doc.rating}</span></div>
  `;
  document
    .querySelectorAll(".consult-type-card")
    .forEach((c, i) => c.classList.toggle("active", i === 0));
  renderDateScroll();
  renderTimeSlots();
  document.getElementById("booking-modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeBookingModal() {
  document.getElementById("booking-modal").classList.remove("open");
  document.body.style.overflow = "";
}

function renderDateScroll() {
  const container = document.getElementById("date-scroll");
  if (!container) return;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  container.innerHTML = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    return `<div class="date-chip ${i === 0 ? "today active" : ""}" onclick="selectDate(this,'${ds}','${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}')">
      <span class="date-day">${i === 0 ? "Today" : days[d.getDay()]}</span>
      <span class="date-num">${d.getDate()}</span>
      <span class="date-avail">${Math.floor(Math.random() * 5) + 3} slots</span>
    </div>`;
  }).join("");
  BookingState.date = today.toISOString().split("T")[0];
  BookingState.dateLabel = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function selectDate(el, ds, label) {
  document
    .querySelectorAll(".date-chip")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  BookingState.date = ds;
  BookingState.dateLabel = label;
  renderTimeSlots();
}

function renderTimeSlots() {
  const grid = document.getElementById("time-slots-grid");
  if (!grid) return;
  const slots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
  ];
  const booked = [1, 4, 7, 10];
  grid.innerHTML = slots
    .map(
      (s, i) =>
        `<div class="time-slot ${booked.includes(i) ? "booked" : ""}" onclick="${booked.includes(i) ? "" : `selectTimeSlot(this,'${s}')`}">${s}</div>`,
    )
    .join("");
  BookingState.time = null;
}

function selectTimeSlot(el, time) {
  document
    .querySelectorAll(".time-slot:not(.booked)")
    .forEach((s) => s.classList.remove("active"));
  el.classList.add("active");
  BookingState.time = time;
}
function selectConsultType(el, type) {
  document
    .querySelectorAll(".consult-type-card")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  BookingState.type = type;
}

function goToBookingStep2() {
  if (!BookingState.time) {
    showToast("⚠️ Please select a time slot");
    return;
  }
  const doc = BookingState.doctor;
  const typeLabel = {
    video: "Video Call 📹",
    audio: "Audio Call 📞",
    chat: "Chat 💬",
  }[BookingState.type];
  document.getElementById("booking-summary").innerHTML = `
    <div class="booking-summary-row"><span>Doctor</span><strong>${doc.name}</strong></div>
    <div class="booking-summary-row"><span>Specialty</span><strong>${doc.specialty}</strong></div>
    <div class="booking-summary-row"><span>Type</span><strong>${typeLabel}</strong></div>
    <div class="booking-summary-row"><span>Date & Time</span><strong>${BookingState.dateLabel} at ${BookingState.time}</strong></div>
    <div class="booking-summary-row"><span>Duration</span><strong>30 minutes</strong></div>
  `;
  updatePaymentDisplay();
  document.getElementById("booking-step-1").style.display = "none";
  document.getElementById("booking-step-2").style.display = "block";
}

function goToBookingStep1() {
  document.getElementById("booking-step-1").style.display = "block";
  document.getElementById("booking-step-2").style.display = "none";
}

function updatePaymentDisplay() {
  const doc = BookingState.doctor;
  if (!doc) return;
  const method = (
    document.querySelector('input[name="payment"]:checked') || {
      value: "coins",
    }
  ).value;
  BookingState.payment = method;
  const base = doc.price;
  let html = "";
  if (method === "coins") {
    const disc = Math.round(base * 0.1);
    html = `<div class="price-row"><span>Consultation Fee</span><strong>₹${base}</strong></div><div class="price-row discount"><span>HU Coins Discount (10%)</span><strong>-₹${disc}</strong></div><div class="price-row total"><span>You Pay</span><strong>${doc.coins} HU Coins</strong></div>`;
  } else if (method === "wallet") {
    html = `<div class="price-row"><span>Consultation Fee</span><strong>₹${base}</strong></div><div class="price-row"><span>Platform Fee</span><strong>₹0</strong></div><div class="price-row total"><span>Total from Wallet</span><strong>₹${base}</strong></div>`;
  } else {
    const gst = Math.round(base * 0.18);
    html = `<div class="price-row"><span>Consultation Fee</span><strong>₹${base}</strong></div><div class="price-row"><span>GST (18%)</span><strong>₹${gst}</strong></div><div class="price-row total"><span>Total</span><strong>₹${base + gst}</strong></div>`;
  }
  document.getElementById("price-breakdown").innerHTML = html;
  document.querySelectorAll(".payment-option").forEach((opt) => {
    const checked = opt.querySelector("input").checked;
    opt.style.borderColor = checked ? "var(--green)" : "";
    opt.style.background = checked ? "var(--green-bg)" : "";
  });
}

function confirmBooking() {
  const doc = BookingState.doctor;
  const typeLabel = {
    video: "Video Call 📹",
    audio: "Audio Call 📞",
    chat: "Chat 💬",
  }[BookingState.type];
  closeBookingModal();
  document.getElementById("success-details").innerHTML =
    `Your <strong>${typeLabel}</strong> with <strong>${doc.name}</strong> is confirmed for <strong>${BookingState.dateLabel} at ${BookingState.time}</strong>. You'll get a reminder 15 minutes before.`;
  document.getElementById("booking-success-modal").classList.add("open");
  if (BookingState.payment === "wallet") {
    const bal =
      parseFloat(document.getElementById("user-balance").textContent) -
      doc.price / 80;
    document.getElementById("user-balance").textContent = Math.max(
      0,
      bal,
    ).toFixed(2);
  }
}

function closeSuccessModal() {
  document.getElementById("booking-success-modal").classList.remove("open");
  document.body.style.overflow = "";
}

/* ============================================
   ✨ JOBS MARKETPLACE LOGIC
   ============================================ */
const ApplyState = { job: null, cvUploaded: false };

function renderJobs(list) {
  const container = document.getElementById("jobs-list");
  if (!container) return;
  const data = list || JOBS;
  if (!data || data.length === 0) {
    container.innerHTML =
      '<div class="no-jobs-msg"><h3>No jobs found</h3><p>Try adjusting your search or filters</p></div>';
    return;
  }
  const myUser = huGetUser();
  const myId = myUser ? String(myUser.id) : null;
  container.innerHTML = data
    .map((job, idx) => {
      const canDelete = job.addedBy && myId && String(job.addedBy) === myId;
      const logo = job.companyLogo || getLetterAvatar(job.company, 80);
      return `
    <div class="job-card ${job.featured ? "featured" : ""}" id="job-${job.id}" style="animation-delay:${idx * 0.05}s">
      ${job.featured ? '<div class="job-featured-badge">⭐ FEATURED</div>' : ""}
      ${canDelete ? `<button class="job-delete-btn" onclick="deleteMyJob('${job.id}', event)">🗑 Remove</button>` : ""}
      <div class="job-card-top">
        <img src="${logo}" alt="${job.company}" class="job-company-logo" loading="lazy"/>
        <div class="job-card-info">
          <div class="job-title" onclick="openApplyModal('${job.id}')">${job.title}</div>
          <div class="job-company"><strong>${job.company}</strong> · 📍 ${job.location}</div>
          <div class="job-meta-pills">
            <span class="job-meta-pill ${getTypePillClass(job.type)}">${job.type}</span>
            <span class="job-meta-pill">🩺 ${job.specialty}</span>
            <span class="job-meta-pill">⏱ ${job.experience}</span>
          </div>
        </div>
      </div>
      <div class="job-description">${job.description}</div>
      <div class="job-tags">${(job.tags || []).map((t) => `<span class="job-tag">${t}</span>`).join("")}</div>
      <div class="job-card-footer">
        <div class="job-footer-left">
          <div class="job-salary">${job.salary}</div>
          <div class="job-footer-meta">
            <span>Posted ${job.posted}</span>
            <strong>Deadline: ${job.deadline}</strong>
          </div>
        </div>
        <div class="job-footer-right">
          <span class="job-applicants">👥 ${job.applicants} applied</span>
          <button class="job-save-btn ${job.saved ? "saved" : ""}" onclick="toggleJobSave('${job.id}', this)" title="${job.saved ? "Unsave" : "Save job"}">🔖</button>
          <button class="job-apply-btn ${job.applied ? "applied" : ""}" onclick="${job.applied ? "" : `openApplyModal('${job.id}')`}">
            ${job.applied ? "✓ Applied" : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  `;
    })
    .join("");
  const countEl = document.getElementById("jobs-count");
  if (countEl) countEl.textContent = data.length;
}

async function deleteMyJob(jobId, event) {
  if (event) event.stopPropagation();
  if (!confirm("Remove this job you posted? This cannot be undone.")) return;
  try {
    const res = await huFetch("/api/jobs/" + jobId, { method: "DELETE" });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) {
      showToast("❌ " + (data.detail || "Could not remove job"));
      return;
    }
    JOBS = JOBS.filter((j) => j.id !== jobId);
    renderJobs();
    showToast("🗑️ Job removed");
  } catch (e) {
    showToast("❌ Could not connect to server");
  }
}

function getTypePillClass(type) {
  if (type === "Full-Time") return "type-full";
  if (type === "Part-Time") return "type-part";
  if (type === "Internship") return "type-intern";
  if (type === "Residency") return "type-residency";
  return "";
}

function searchJobs(q) {
  const query = q.toLowerCase();
  renderJobs(
    JOBS.filter(
      (j) =>
        !query ||
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.specialty.toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query) ||
        j.tags.some((t) => t.toLowerCase().includes(query)),
    ),
  );
}

function filterJobsByType(type, btn) {
  document
    .querySelectorAll(".job-type-pill")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  renderJobs(type === "All" ? JOBS : JOBS.filter((j) => j.type === type));
}

function filterJobsBySpecialty(val) {
  renderJobs(val === "All" ? JOBS : JOBS.filter((j) => j.specialty === val));
}

function filterJobsByLocation(val) {
  renderJobs(
    val === "All" ? JOBS : JOBS.filter((j) => j.location.includes(val)),
  );
}

function toggleJobSave(jobId, btn) {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return;
  job.saved = !job.saved;
  btn.classList.toggle("saved", job.saved);
  showToast(job.saved ? "🔖 Job saved!" : "Job removed from saved");
}

function switchJobsTab(tab, btn) {
  document
    .querySelectorAll(".jobs-tab")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const jobsList = document.getElementById("jobs-list");
  const appsList = document.getElementById("applications-list");
  if (tab === "browse") {
    if (jobsList) jobsList.style.display = "";
    if (appsList) appsList.style.display = "none";
    renderJobs();
  } else if (tab === "saved") {
    if (jobsList) jobsList.style.display = "";
    if (appsList) appsList.style.display = "none";
    renderJobs(JOBS.filter((j) => j.saved));
  } else if (tab === "applications") {
    if (jobsList) jobsList.style.display = "none";
    if (appsList) appsList.style.display = "";
    renderMyApplications();
  }
}

function renderMyApplications() {
  const container = document.getElementById("applications-list");
  if (!container) return;
  if (!MY_APPLICATIONS || MY_APPLICATIONS.length === 0) {
    container.innerHTML = `<div class="no-jobs-msg"><h3>No applications yet</h3><p>Start applying to jobs and track your progress here</p></div>`;
    return;
  }
  container.innerHTML = MY_APPLICATIONS.map(
    (app) => `
    <div class="application-card">
      <img src="${app.logo}" alt="${app.company}"/>
      <div class="application-info">
        <div class="application-title">${app.title}</div>
        <div class="application-company">${app.company} · Applied ${app.appliedDate}</div>
      </div>
      <span class="application-status ${app.statusClass}">${app.status}</span>
    </div>
  `,
  ).join("");
}

function openApplyModal(jobId) {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return;
  ApplyState.job = job;
  ApplyState.cvUploaded = false;
  document.getElementById("apply-job-title").textContent = job.title;
  document.getElementById("apply-job-company").textContent =
    job.company + " · " + job.location;
  document.getElementById("apply-job-logo").src = job.companyLogo;
  const nameInput = document.getElementById("apply-name");
  const emailInput = document.getElementById("apply-email");
  const coverInput = document.getElementById("apply-cover");
  if (nameInput) nameInput.value = "Dr. Michael Chen";
  if (emailInput) emailInput.value = "michael.chen@email.com";
  if (coverInput) coverInput.value = "";
  renderCvZone(false);
  document.getElementById("apply-modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeApplyModal() {
  document.getElementById("apply-modal").classList.remove("open");
  document.body.style.overflow = "";
}

function renderCvZone(uploaded) {
  const zone = document.getElementById("cv-upload-zone");
  if (!zone) return;
  if (uploaded) {
    zone.innerHTML = `<div class="cv-uploaded"><span>📄 Resume_MichaelChen.pdf</span><button class="cv-remove-btn" onclick="renderCvZone(false); ApplyState.cvUploaded=false;">✕</button></div>`;
  } else {
    zone.innerHTML = `<div class="cv-upload-zone" onclick="simulateCvUpload()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;stroke:var(--muted-2);margin:0 auto 8px;display:block;">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      <p><strong>Click to upload</strong> your CV / Resume</p><small>PDF, DOC up to 5MB</small>
    </div>`;
  }
}

function simulateCvUpload() {
  ApplyState.cvUploaded = true;
  renderCvZone(true);
  showToast("📄 CV uploaded successfully!");
}

function submitApplication() {
  const job = ApplyState.job;
  if (!job) return;
  if (!ApplyState.cvUploaded) {
    showToast("⚠️ Please upload your CV first");
    return;
  }
  job.applied = true;
  job.applicants += 1;
  MY_APPLICATIONS.unshift({
    id: job.id,
    title: job.title,
    company: job.company,
    logo: job.companyLogo,
    appliedDate: "Just now",
    status: "Under Review",
    statusClass: "under-review",
  });
  closeApplyModal();
  document.getElementById("apply-success-job").textContent =
    job.title + " at " + job.company;
  document.getElementById("apply-success-modal").classList.add("open");
  renderJobs();
}

function closeApplySuccess() {
  document.getElementById("apply-success-modal").classList.remove("open");
  document.body.style.overflow = "";
}

/* ============================================================
   ✨ SETTINGS PAGE LOGIC
   ============================================================ */

/* Switch settings tab */
function switchSettingsTab(tab, btn) {
  document
    .querySelectorAll(".settings-nav-item")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document
    .querySelectorAll(".settings-tab")
    .forEach((t) => t.classList.remove("active"));
  const target = document.getElementById("stab-" + tab);
  if (target) target.classList.add("active");
}

/* Toggle a settings switch */
function toggleSettingSwitch(id, labelId, onMsg, offMsg) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const isOn = btn.classList.toggle("on");
  if (labelId) {
    const label = document.getElementById(labelId);
    if (label) label.textContent = isOn ? "On" : "Off";
  }
  showToast(isOn ? onMsg || "✓ Saved!" : offMsg || "✓ Saved!");
}

/* Save settings section */
function saveSettings(section) {
  // Update sidebar name if profile saved
  if (section === "Profile") {
    const nameVal = document.getElementById("sf-name");
    if (nameVal && nameVal.value) {
      const sidebarName = document.querySelector(".sidebar-user-name");
      if (sidebarName)
        sidebarName.textContent =
          nameVal.value.length > 14
            ? nameVal.value.slice(0, 13) + "..."
            : nameVal.value;
    }
    const specialtyVal = document.getElementById("sf-specialty");
    if (specialtyVal) {
      const sidebarRole = document.querySelector(".sidebar-user-role");
      if (sidebarRole) sidebarRole.textContent = specialtyVal.value;
    }
  }
  showToast("✓ " + section + " settings saved!");
}

/* Select theme — REAL implementation */
function selectTheme(theme, el) {
  document
    .querySelectorAll(".settings-theme-card")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    localStorage.setItem("hu-theme", "dark");
    showToast("🌙 Dark mode enabled!");
  } else if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.body.classList.toggle("dark-mode", prefersDark);
    localStorage.setItem("hu-theme", "system");
    showToast("💻 System theme applied!");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("hu-theme", "light");
    showToast("☀️ Light mode enabled!");
  }
}

/* Apply saved theme on load */
function applyStoredTheme() {
  const saved = localStorage.getItem("hu-theme") || "light";
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    const card = document.getElementById("theme-dark");
    if (card) {
      document
        .querySelectorAll(".settings-theme-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    }
  } else if (saved === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.body.classList.toggle("dark-mode", prefersDark);
    const card = document.getElementById("theme-system");
    if (card) {
      document
        .querySelectorAll(".settings-theme-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    }
  }
}

/* Confirm logout */
function confirmLogout() {
  document.getElementById("logout-modal").classList.add("open");
}

/* ============================================================
   ✨ SETTINGS PAGE LOGIC
   ============================================================ */

/* Switch settings tab */
function switchSettingsTab(tab, btn) {
  document
    .querySelectorAll(".settings-nav-item")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document
    .querySelectorAll(".settings-tab")
    .forEach((t) => t.classList.remove("active"));
  const target = document.getElementById("stab-" + tab);
  if (target) target.classList.add("active");
}

/* Toggle a settings switch */
function toggleSettingSwitch(id, labelId, onMsg, offMsg) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const isOn = btn.classList.toggle("on");
  if (labelId) {
    const label = document.getElementById(labelId);
    if (label) label.textContent = isOn ? "On" : "Off";
  }
  showToast(isOn ? onMsg || "✓ Saved!" : offMsg || "✓ Saved!");
}

/* Save settings section */
function saveSettings(section) {
  // Update sidebar name if profile saved
  if (section === "Profile") {
    const nameVal = document.getElementById("sf-name");
    if (nameVal && nameVal.value) {
      const sidebarName = document.querySelector(".sidebar-user-name");
      if (sidebarName)
        sidebarName.textContent =
          nameVal.value.length > 14
            ? nameVal.value.slice(0, 13) + "..."
            : nameVal.value;
    }
    const specialtyVal = document.getElementById("sf-specialty");
    if (specialtyVal) {
      const sidebarRole = document.querySelector(".sidebar-user-role");
      if (sidebarRole) sidebarRole.textContent = specialtyVal.value;
    }
  }
  showToast("✓ " + section + " settings saved!");
}

/* Select theme — REAL implementation */
function selectTheme(theme, el) {
  document
    .querySelectorAll(".settings-theme-card")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    localStorage.setItem("hu-theme", "dark");
    showToast("🌙 Dark mode enabled!");
  } else if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.body.classList.toggle("dark-mode", prefersDark);
    localStorage.setItem("hu-theme", "system");
    showToast("💻 System theme applied!");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("hu-theme", "light");
    showToast("☀️ Light mode enabled!");
  }
}

/* Apply saved theme on load */
function applyStoredTheme() {
  const saved = localStorage.getItem("hu-theme") || "light";
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    const card = document.getElementById("theme-dark");
    if (card) {
      document
        .querySelectorAll(".settings-theme-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    }
  } else if (saved === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.body.classList.toggle("dark-mode", prefersDark);
    const card = document.getElementById("theme-system");
    if (card) {
      document
        .querySelectorAll(".settings-theme-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    }
  }
}

/* Confirm logout */
function confirmLogout() {
  document.getElementById("logout-modal").classList.add("open");
}

/* ============================================
   WALLET & TRANSACTIONS LOGIC
   ============================================ */

function renderWallet() {
  renderTransactions();
  renderEarningsLegend();
}

function renderTransactions(filter = "all") {
  const container = document.getElementById("transactions-list");
  if (!container || typeof TRANSACTIONS === "undefined") return;

  const filtered =
    filter === "all"
      ? TRANSACTIONS
      : TRANSACTIONS.filter((t) => t.type === filter);

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="no-jobs-msg"><h3>No transactions found</h3><p>Try a different filter</p></div>';
    return;
  }

  container.innerHTML = filtered
    .map((t) => {
      const amountClass =
        t.amount >= 0
          ? t.currency === "coins"
            ? "coins"
            : "positive"
          : "negative";
      const amountPrefix = t.amount >= 0 ? "+" : "";
      const amountSuffix = t.currency === "coins" ? " coins" : "";
      const amountDisplay =
        t.currency === "coins"
          ? `${amountPrefix}${t.amount.toLocaleString()}${amountSuffix}`
          : `${amountPrefix}$${Math.abs(t.amount).toFixed(2)}`;

      return `
      <div class="transaction-row" onclick="showToast('📄 Transaction details coming soon!')">
        <div class="txn-icon ${t.type}">${t.icon}</div>
        <div class="txn-info">
          <div class="txn-title">${t.title}</div>
          <div class="txn-desc">${t.description}</div>
        </div>
        <div class="txn-meta">
          <span class="txn-amount ${amountClass}">${amountDisplay}</span>
          <span class="txn-date">${t.date} · ${t.time}</span>
          ${t.status === "pending" ? '<span class="txn-status pending">⏳ Pending</span>' : ""}
        </div>
      </div>
    `;
    })
    .join("");
}

function renderEarningsLegend() {
  const container = document.getElementById("earnings-legend");
  if (!container || typeof EARNING_SOURCES === "undefined") return;

  container.innerHTML = EARNING_SOURCES.map(
    (s) => `
    <div class="earnings-legend-item">
      <div class="legend-color" style="background:${s.color}"></div>
      <div class="legend-info">
        <strong>${s.label}</strong>
        <span>${s.percent}% of earnings</span>
      </div>
      <span class="legend-amount">$${s.amount.toFixed(2)}</span>
    </div>
  `,
  ).join("");
}

function filterTransactions(filter, btn) {
  document
    .querySelectorAll(".txn-filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderTransactions(filter);
}

function openWithdrawModal() {
  document.getElementById("withdraw-amount").value = "";
  updateWithdrawDisplay(0);
  document.getElementById("withdraw-modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeWithdrawModal() {
  document.getElementById("withdraw-modal").classList.remove("open");
  document.body.style.overflow = "";
}

function setWithdrawAmount(amount) {
  document.getElementById("withdraw-amount").value = amount;
  validateWithdrawAmount();
}

function validateWithdrawAmount() {
  const input = document.getElementById("withdraw-amount");
  const btn = document.getElementById("withdraw-confirm-btn");
  const amount = parseFloat(input.value) || 0;
  const maxBalance = 124.5;

  if (amount >= 10 && amount <= maxBalance) {
    btn.disabled = false;
    updateWithdrawDisplay(amount);
  } else {
    btn.disabled = true;
    updateWithdrawDisplay(0);
  }
}

function updateWithdrawDisplay(amount) {
  document.getElementById("withdraw-display-amount").textContent =
    `$${amount.toFixed(2)}`;
  document.getElementById("withdraw-receive-amount").textContent =
    `$${amount.toFixed(2)}`;
}

function confirmWithdrawal() {
  const amount =
    parseFloat(document.getElementById("withdraw-amount").value) || 0;
  const method = document.querySelector(
    'input[name="withdraw-method"]:checked',
  ).value;
  const methodLabels = {
    bank: "2-3 business days",
    upi: "within minutes",
    paypal: "1-2 business days",
  };

  closeWithdrawModal();

  // Update balance
  const currentBal = parseFloat(
    document.getElementById("wallet-balance").textContent,
  );
  const newBal = Math.max(0, currentBal - amount);
  document.getElementById("wallet-balance").textContent = newBal.toFixed(2);
  document.getElementById("user-balance").textContent = newBal.toFixed(2);
  const mobBal = document.getElementById("mobile-user-balance");
  if (mobBal) mobBal.textContent = newBal.toFixed(2);

  // Show success
  document.getElementById("withdraw-success-details").innerHTML =
    `Your withdrawal of <strong>$${amount.toFixed(2)}</strong> has been initiated. You'll receive it ${methodLabels[method]}.`;
  document.getElementById("withdraw-success-modal").classList.add("open");
}

function closeWithdrawSuccess() {
  document.getElementById("withdraw-success-modal").classList.remove("open");
  document.body.style.overflow = "";
}

// Update navigate function to include wallet
const originalNavigate = navigate;
navigate = function (pageId, clickedBtn) {
  originalNavigate(pageId, clickedBtn);
  if (pageId === "wallet") renderWallet();
};

function toggleSidebar() {

  document.querySelector(".sidebar").classList.toggle("open");
  document.getElementById("sidebar-overlay").classList.toggle("show");
}

/* ============================================
   ADS MANAGER LOGIC
   ============================================ */
async function renderAdsManager() {
  const list = document.getElementById('ads-campaigns-list');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted);padding:20px 0;">Loading campaigns…</p>';

  const campaigns = await huGetMyCampaigns();

  if (!campaigns || campaigns.length === 0) {
    list.innerHTML = '<div class="no-jobs-msg"><h3>No campaigns yet</h3><p>Create your first ad campaign to reach the Healthy Universe community</p></div>';
    updateAdsStats([]);
    return;
  }

  updateAdsStats(campaigns);

  list.innerHTML = campaigns.map(c => {
    // const creative = c.creative || {};
    // // const img = creative.image_url ? (HU_API + creative.image_url) : '';
    // const img = creative.image_url
    //   ? creative.image_url.startsWith("http")
    //     ? creative.image_url
    //     : HU_API + creative.image_url
    //   : "";
    // const pct = c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
    // return `
    //   <div class="campaign-card">
    //     <div class="campaign-card-top">
    //       ${img ? `<img src="${img}" class="campaign-thumb"/>` : '<div class="campaign-thumb"></div>'}
    const creative = c.creative || {};
    const img = creative.image_url
      ? creative.image_url.startsWith("http")
        ? creative.image_url
        : HU_API + creative.image_url
      : "";
    const isVideoThumb = /\.(mp4|webm|mov)$/i.test(img);
    const thumbHtml = img
      ? isVideoThumb
        ? `<video src="${img}" class="campaign-thumb" muted></video>`
        : `<img src="${img}" class="campaign-thumb"/>`
      : '<div class="campaign-thumb"></div>';
    const pct =
      c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
    return `
      <div class="campaign-card">
        <div class="campaign-card-top">
          ${thumbHtml}
          <div class="campaign-info">
            <div class="campaign-name">${c.name}</div>
            <div class="campaign-headline">${creative.headline || ""}</div>
            <div class="campaign-badges">
              <span class="campaign-badge ${c.status}">${c.status === "active" ? "● Active" : "⏸ Paused"}</span>
              <span class="campaign-badge objective">${c.objective}</span>
            </div>
          </div>
          <div class="campaign-actions">
            <button class="campaign-action-btn" onclick="toggleCampaignStatus('${c.id}','${c.status === "active" ? "paused" : "active"}')">${c.status === "active" ? "Pause" : "Resume"}</button>
            <button class="campaign-action-btn danger" onclick="removeCampaign('${c.id}')">Delete</button>
          </div>
        </div>
        <div class="campaign-metrics">
          <div class="campaign-metric"><strong>${formatNum(c.impressions)}</strong><span>Impressions</span></div>
          <div class="campaign-metric"><strong>${formatNum(c.clicks)}</strong><span>Clicks</span></div>
          <div class="campaign-metric"><strong>${c.ctr}%</strong><span>CTR</span></div>
          <div class="campaign-metric"><strong>$${parseFloat(c.spent).toFixed(2)}</strong><span>Spent</span></div>
          <div class="campaign-metric"><strong>$${c.remaining.toFixed(2)}</strong><span>Remaining</span></div>
        </div>
        <div class="campaign-progress"><div class="campaign-progress-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

function updateAdsStats(campaigns) {
  const totalImp = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClk = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + parseFloat(c.spent || 0), 0);
  document.getElementById('ads-total-campaigns').textContent = campaigns.length;
  document.getElementById('ads-total-impressions').textContent = formatNum(totalImp);
  document.getElementById('ads-total-clicks').textContent = formatNum(totalClk);
  document.getElementById('ads-total-spent').textContent = '$' + totalSpent.toFixed(2);
}

async function toggleCampaignStatus(id, newStatus) {
  await huSetCampaignStatus(id, newStatus);
  showToast(newStatus === 'active' ? '▶️ Campaign resumed' : '⏸ Campaign paused');
  renderAdsManager();
}

async function removeCampaign(id) {
  if (!confirm('Delete this campaign? This cannot be undone.')) return;
  await huDeleteCampaign(id);
  showToast('🗑️ Campaign deleted');
  renderAdsManager();
}

// function openNewCampaignModal() {
//   ['camp-name','camp-headline','camp-body-text','camp-cta-link','camp-location'].forEach(id => {
//     const el = document.getElementById(id); if (el) el.value = '';
//   });
//   const budget = document.getElementById('camp-budget'); if (budget) budget.value = '';
//   const img = document.getElementById('camp-image'); if (img) img.value = '';
//   document.getElementById('campaign-modal').classList.add('open');
//   document.body.style.overflow = 'hidden';
// }

function openNewCampaignModal() {
  [
    "camp-name",
    "camp-headline",
    "camp-body-text",
    "camp-cta-link",
    "camp-location",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const budget = document.getElementById("camp-budget");
  if (budget) budget.value = "";
  const img = document.getElementById("camp-image");
  if (img) img.value = "";

  document
    .querySelectorAll('#camp-specialty-multiselect input[type="checkbox"]')
    .forEach((cb) => {
      cb.checked = cb.value === "All";
    });

  document.getElementById("campaign-modal").classList.add("open");
  document.body.style.overflow = "hidden";
}
// function closeCampaignModal() {
//   document.getElementById('campaign-modal').classList.remove('open');
//   document.body.style.overflow = '';
// }

// async function submitCampaign() {
function closeCampaignModal() {
  document.getElementById("campaign-modal").classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("change", function (e) {
  if (e.target.matches('#camp-specialty-multiselect input[type="checkbox"]')) {
    const container = document.getElementById("camp-specialty-multiselect");
    const allCb = container.querySelector('input[value="All"]');
    if (e.target.value === "All" && e.target.checked) {
      container
        .querySelectorAll('input[type="checkbox"]:not([value="All"])')
        .forEach((cb) => (cb.checked = false));
    } else if (e.target.value !== "All" && e.target.checked) {
      if (allCb) allCb.checked = false;
    }
  }
});

async function submitCampaign() {
  const name = document.getElementById("camp-name").value.trim();
  const headline = document.getElementById("camp-headline").value.trim();
  const budget = document.getElementById("camp-budget").value;

  if (!name) {
    showToast("⚠️ Campaign name required");
    return;
  }
  if (!headline) {
    showToast("⚠️ Ad headline required");
    return;
  }
  if (!budget || parseFloat(budget) <= 0) {
    showToast("⚠️ Enter a valid budget");
    return;
  }

  const btn = document.getElementById("camp-submit-btn");
  btn.disabled = true;
  btn.textContent = "Launching…";

  try {
    await huCreateCampaign({
      name: name,
      objective: document.getElementById("camp-objective").value,
      budget: budget,
      bidAmount: document.getElementById("camp-bid").value,
      targetSpecialty: document.getElementById("camp-specialty").value,
      targetLocation: document.getElementById("camp-location").value,
      endDate: document.getElementById("camp-end-date").value,
      headline: headline,
      bodyText: document.getElementById("camp-body-text").value,
      ctaText: document.getElementById("camp-cta-text").value,
      ctaLink: document.getElementById("camp-cta-link").value,
      imageFile: (document.getElementById("camp-image").files || [])[0] || null,
    });
    showToast("🚀 Campaign launched!");
    closeCampaignModal();
    renderAdsManager();
  } catch (err) {
    showToast("❌ " + (err.message || "Failed to create campaign"));
  } finally {
    btn.disabled = false;
    btn.textContent = "Launch Campaign";
  }
}

/* ============================================
   SPONSORED AD INJECTION INTO FEED
   ============================================ */

   async function injectSponsoredAd() {
     const ad = await huServeAd();
     if (!ad || !ad.creative_id) return;

     const container = document.getElementById("feed-container");
     if (!container) return;

     // Resolve media URL (handles absolute and relative backend paths)
     const img = ad.image_url
       ? ad.image_url.startsWith("http")
         ? ad.image_url
         : HU_API + ad.image_url
       : "";

     // Check if media is video or image
     const isVideoAd = /\.(mp4|webm|mov)$/i.test(img);
     const mediaHtml = img
       ? isVideoAd
         ? `<div class="post-image-wrap"><video src="${img}" class="post-image" controls></video></div>`
         : `<div class="post-image-wrap"><img src="${img}" class="post-image"/></div>`
       : "";

     // Build the complete ad post HTML
     const html = `
    <article class="post-card sponsored-post" data-campaign-id="${ad.id}" data-creative-id="${ad.creative_id}">
      <div class="post-top">
        <img src="${getLetterAvatar(ad.advertiser_name, 80)}" alt="${ad.advertiser_name}"/>
        <div class="post-meta">
          <div class="post-name">${ad.advertiser_name}</div>
          <div class="post-role">Sponsored</div>
        </div>
        <span class="sponsored-label">Sponsored</span>
      </div>
      <div class="post-body">
        <div class="post-title">${ad.headline}</div>
        <div class="post-text">${ad.body_text || ""}</div>
      </div>
      ${mediaHtml}
      <div style="padding:14px 16px;">
        <button class="sponsored-cta-btn" onclick="handleAdClick('${ad.id}','${ad.creative_id}','${ad.cta_link || ""}')">
          ${ad.cta_text || "Learn More"}
        </button>
      </div>
    </article>
  `;

     // Inject after the 3rd post, or append if fewer posts exist
     const posts = container.querySelectorAll(".post-card");
     if (posts.length >= 3) {
       posts[2].insertAdjacentHTML("afterend", html);
     } else {
       container.insertAdjacentHTML("beforeend", html);
     }

     // Log impression for analytics
     huLogAdImpression(ad.id, ad.creative_id);
   }
// async function injectSponsoredAd() {
//   const ad = await huServeAd();
//   if (!ad || !ad.creative_id) return;

//   const container = document.getElementById('feed-container');
//   if (!container) return;

//   // // const img = ad.image_url ? (HU_API + ad.image_url) : '';
//   // const img = ad.image_url
//   //   ? ad.image_url.startsWith("http")
//   //     ? ad.image_url
//   //     : HU_API + ad.image_url
//   //   : "";
//   // const html = `
//   //   <article class="post-card sponsored-post" data-campaign-id="${ad.id}" data-creative-id="${ad.creative_id}">
//   //     <div class="post-top">
//   //       <img src="${getLetterAvatar(ad.advertiser_name, 80)}" alt="${ad.advertiser_name}"/>
//   //       <div class="post-meta">
//   //         <div class="post-name">${ad.advertiser_name}</div>
//   //         <div class="post-role">Sponsored</div>
//   //       </div>
//   //       <span class="sponsored-label">Sponsored</span>
//   //     </div>
//   //     <div class="post-body">
//   //       <div class="post-title">${ad.headline}</div>
//   //       <div class="post-text">${ad.body_text || ''}</div>
//   //     </div>
//   //     ${img ? `<div class="post-image-wrap"><img src="${img}" class="post-image"/></div>` : ''}
//   const img = ad.image_url
//     ? ad.image_url.startsWith("http")
//       ? ad.image_url
//       : HU_API + ad.image_url
//     : "";
//   const isVideoAd = /\.(mp4|webm|mov)$/i.test(img);
//   const mediaHtml = img
//     ? isVideoAd
//       ? `<div class="post-image-wrap"><video src="${img}" class="post-image" controls></video></div>`
//       : `<div class="post-image-wrap"><img src="${img}" class="post-image"/></div>`
//     : "";
//   const html = `
//     <article class="post-card sponsored-post" data-campaign-id="${ad.id}" data-creative-id="${ad.creative_id}">
//       <div class="post-top">
//         <img src="${getLetterAvatar(ad.advertiser_name, 80)}" alt="${ad.advertiser_name}"/>
//         <div class="post-meta">
//           <div class="post-name">${ad.advertiser_name}</div>
//           <div class="post-role">Sponsored</div>
//         </div>
//         <span class="sponsored-label">Sponsored</span>
//       </div>
//       <div class="post-body">
//         <div class="post-title">${ad.headline}</div>
//         <div class="post-text">${ad.body_text || ""}</div>
//       </div>
//       ${mediaHtml}
//       <div style="padding:14px 16px;">
//         <button class="sponsored-cta-btn" onclick="handleAdClick('${ad.id}','${ad.creative_id}','${ad.cta_link || ""}')">${ad.cta_text || "Learn More"}</button>
//       </div>
//     </article>
//   `;

//   const posts = container.querySelectorAll('.post-card');
//   if (posts.length >= 3) {
//     posts[2].insertAdjacentHTML('afterend', html);
//   } else {
//     container.insertAdjacentHTML('beforeend', html);
//   }

//   huLogAdImpression(ad.id, ad.creative_id);
// }

function handleAdClick(campaignId, creativeId, link) {
  huLogAdClick(campaignId, creativeId);
  if (link) window.open(link, '_blank');
}

function calculateHealthScore() {
  const hEl = document.getElementById("hs-height");
  const wEl = document.getElementById("hs-weight");
  const aEl = document.getElementById("hs-age");
  if (!hEl || !wEl || !aEl) return;

  const h = parseFloat(hEl.value);
  const w = parseFloat(wEl.value);
  const age = parseFloat(aEl.value);
  if (!h || !w || h <= 0) return;

  const hm = h / 100;
  const bmi = w / (hm * hm);
  const bmiR = Math.round(bmi * 10) / 10;

  let bmiScore;
  if (bmi < 18.5) bmiScore = 60 + (bmi - 15) * 4;
  else if (bmi <= 24.9) bmiScore = 95;
  else if (bmi <= 29.9) bmiScore = 90 - (bmi - 25) * 6;
  else bmiScore = 60 - (bmi - 30) * 2;

  const ageFactor = age < 40 ? 0 : age < 60 ? -3 : -6;
  const score = Math.max(10, Math.min(99, Math.round(bmiScore + ageFactor)));

  let category;
  if (bmi < 18.5) category = "underweight";
  else if (bmi <= 24.9) category = "normal range";
  else if (bmi <= 29.9) category = "overweight";
  else category = "obese range";

  let label;
  if (score >= 85) label = "Excellent";
  else if (score >= 70) label = "Good";
  else if (score >= 50) label = "Fair";
  else label = "Needs attention";

  document.getElementById("hs-num").textContent = score;
  document.getElementById("hs-label").textContent = label;
  document.getElementById("hs-sub").textContent =
    "BMI " + bmiR.toFixed(1) + " · " + category;
  document.getElementById("hs-bar-fill").style.width = score + "%";
}

["hs-height", "hs-weight", "hs-age"].forEach(function (id) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", calculateHealthScore);
});


// ── SPIN THE WHEEL DAILY POPUP LOGIC ──

// Page load hote hi check karega agar aaj ka spin baki hai
document.addEventListener("DOMContentLoaded", () => {
    checkDailySpinPopup();
});

function checkDailySpinPopup() {
    const lastSpinDate = localStorage.getItem("lastHealthSpinDate");
    const today = new Date().toDateString(); // Format: "Sat Jul 11 2026"

    // Agar user ne aaj pehle spin nahi kiya hai, toh popup show karo
    if (lastSpinDate !== today) {
        setTimeout(() => {
            const modal = document.getElementById("daily-spin-modal");
            if (modal) modal.style.display = "flex";
        }, 1500); // Page open hone ke 1.5 seconds baad smooth entry lega
    }
}

function closeSpinModal() {
    const modal = document.getElementById("daily-spin-modal");
    if (modal) modal.style.display = "none";
}

function startLuckySpin() {
    const wheel = document.getElementById("lucky-wheel");
    const btn = document.getElementById("spin-trigger-btn");
    const msg = document.getElementById("spin-reward-msg");
    
    if (!wheel || !btn) return;
    
    btn.disabled = true; // Taaki bar-bar click na ho
    btn.style.opacity = "0.6";
    if (msg) msg.innerText = "";

    // Random rotation degree (kam se kam 5 complete rounds lagaye + extra random angle)
    const randomDegree = Math.floor(3000 + Math.random() * 2000); 
    wheel.style.transform = `rotate(${randomDegree}deg)`;

    // 4 seconds ka spin animation khatam hone ka wait karein
    setTimeout(() => {
        // Rewards possibilities array
        const rewards = [
            "🎁 10 HU Coins!", 
            "🍏 Free Diet Plan Chart!", 
            "🪙 50 HU Coins Super Bonus!", 
            "🩺 10% Off on next Consultation!", 
            "💡 Daily Healthy Tip Unlocked!", 
            "🎁 5 HU Coins!"
        ];
        
        // Exact landing segment calculation
        const actualMutedDegree = randomDegree % 360;
        const segmentIndex = Math.floor(actualMutedDegree / 60); // 6 categories hain total
        const finalReward = rewards[segmentIndex] || "🎁 5 HU Coins!";

        // Reward message show karein
        if (msg) msg.innerText = `🎉 Congratulations! You won: ${finalReward}`;
        
        // LocalStorage mein date save karein taaki aaj dubara na khule
        const today = new Date().toDateString();
        localStorage.setItem("lastHealthSpinDate", today);

        // Agar project mein pehle se showToast defined hai toh use call karein
        if (typeof showToast === "function") {
            showToast(`Won ${finalReward}!`);
        }

        setTimeout(() => {
            closeSpinModal();
        }, 2500);

    }, 4000); // Match with CSS transition time (4s)
}


// 1. 3-LEVEL DATA BANK (8 UNIQUE QUESTIONS PER LEVEL)
// const arcadeLevels = {
//     1: [
//         { type: "mcq", question: "What is the recommended average daily water intake for adults?", options: ["1-2 Liters", "3-4 Liters", "2-3 Liters", "5 Liters"], answer: 2 },
//         { type: "mcq", question: "How many hours of sleep do health experts generally recommend for adults?", options: ["5-6 hours", "7-9 hours", "10-12 hours", "4-5 hours"], answer: 1 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this essential daily habit: 'K L A W'", correctWord: "WALK", hint: "A simple form of physical activity done on foot." },
//         { type: "mcq", question: "Which macro-nutrient gives your body quick, immediate energy?", options: ["Proteins", "Fats", "Carbohydrates", "Vitamins"], answer: 2 },
//         { type: "mcq", question: "What is the healthiest way to cook vegetables to preserve their nutrients?", options: ["Deep Frying", "Boiling heavily", "Steaming", "Microwaving without water"], answer: 2 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this healthy sleep state: 'M A E R D'", correctWord: "DREAM", hint: "Occurs during the REM stage of sleeping." },
//         { type: "mcq", question: "Which of these is considered a healthy baseline resting heart rate?", options: ["60-100 bpm", "120-150 bpm", "30-40 bpm", "160-180 bpm"], answer: 0 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this natural stress-reliever: 'A G O Y'", correctWord: "YOGA", hint: "An ancient practice involving physical postures and breathing." }
//     ],
//     2: [
//         { type: "mcq", question: "Which vitamin is synthesized when human skin is exposed to direct sunlight?", options: ["Vitamin A", "Vitamin C", "Vitamin B12", "Vitamin D"], answer: 3 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this macronutrient group: 'N I E T O R P'", correctWord: "PROTEIN", hint: "Essential for muscle building and structural repair." },
//         { type: "mcq", question: "Which mineral is highly crucial for building and maintaining strong bones?", options: ["Iron", "Calcium", "Zinc", "Potassium"], answer: 1 },
//         { type: "mcq", question: "Deficiency of which vitamin causes temporary or permanent night blindness?", options: ["Vitamin B", "Vitamin K", "Vitamin A", "Vitamin C"], answer: 2 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this natural sugar alternative: 'Y E N O H'", correctWord: "HONEY", hint: "Sweet fluid made by bees from flower nectar." },
//         { type: "mcq", question: "Which organ produces insulin to regulate blood glucose levels?", options: ["Liver", "Pancreas", "Kidney", "Stomach"], answer: 1 },
//         { type: "mcq", question: "Citrus fruits like Oranges and Lemons are rich sources of which vitamin?", options: ["Vitamin C", "Vitamin D", "Vitamin E", "Vitamin B6"], answer: 0 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this gut-friendly food nutrient: 'R E B I F'", correctWord: "FIBER", hint: "Indigestible plant food part that helps your digestion." }
//     ],
//     3: [
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this vital filtering organ: 'Y E N D I K'", correctWord: "KIDNEY", hint: "It filters waste and excess fluids from your bloodstream." },
//         { type: "mcq", question: "What is the normal blood pressure range for a healthy resting adult?", options: ["140/90 mmHg", "120/80 mmHg", "90/60 mmHg", "160/100 mmHg"], answer: 1 },
//         { type: "mcq", question: "Which type of blood cells are primarily responsible for fighting infections?", options: ["Red Blood Cells", "White Blood Cells", "Platelets", "Plasma Cells"], answer: 1 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this critical master body gland: 'Y R A T I U T I P'", correctWord: "PITUITARY", hint: "The master gland at the base of the brain regulating hormones." },
//         { type: "mcq", question: "What is the largest internal organ in the entire human body?", options: ["Brain", "Liver", "Heart", "Lungs"], answer: 1 },
//         { type: "puzzle", question: "🧩 PUZZLE: Unscramble this compound that carries oxygen: 'N I B O L G O M E H'", correctWord: "HEMOGLOBIN", hint: "Iron-rich protein present in your red blood cells." },
//         { type: "mcq", question: "How many bones are there in an adult human skeletal framework?", options: ["206 bones", "306 bones", "156 bones", "216 bones"], answer: 0 },
//         { type: "mcq", question: "Which vital biological gas do red blood cells distribute to your tissues?", options: ["Nitrogen", "Carbon Dioxide", "Oxygen", "Hydrogen"], answer: 2 }
//     ]
// };

// // State Tracking Variables
// let arcadeScore = 0;
// let currentLevel = 1; 
// let currentQuestionData = null;
// let currentLevelQueue = [];

// // Fisher-Yates Shuffle Algorithm to randomize layout questions within a specific level
// function shuffleLevelPool(level) {
//     let tempPool = [...arcadeLevels[level]];
//     for (let i = tempPool.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [tempPool[i], tempPool[j]] = [tempPool[j], tempPool[i]];
//     }
//     return tempPool;
// }

// 2. MAIN ENGINE: LOAD LEVEL SMART QUESTION
// function loadNextArcadeQuestion() {
//     const qText = document.getElementById("arcade-question");
//     const optContainer = document.getElementById("arcade-options-container");
//     const nextBtn = document.getElementById("arcade-next-btn");

//     if (!qText || !optContainer) return;

//     if (nextBtn) nextBtn.style.display = "none";
//     optContainer.innerHTML = "";

//     // Clear unique inline grid configurations
//     optContainer.style.display = "grid";
//     optContainer.style.gridTemplateColumns = "1fr 1fr";
//     optContainer.style.flexDirection = "unset";
//     optContainer.style.gap = "16px";

//     // Level Check and Switch Logic
//     if (currentLevelQueue.length === 0) {
//         if (arcadeLevels[currentLevel]) {
//             currentLevelQueue = shuffleLevelPool(currentLevel);
//             showToast(`Welcome to Level ${currentLevel}! 🚀`);
//         } else {
//             // Infinite Fallback: Game completes all 3 levels, resets back dynamically to 1 with accumulated score
//             qText.innerHTML = `🎉 Champion Status! You completed all 3 levels with ${arcadeScore} points!`;
//             optContainer.innerHTML = `<button onclick="resetWholeArcadeGame()" style="grid-column: span 2; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">Restart Arcade 🔄</button>`;
//             return;
//         }
//     }

//     // Extract next non-repeating question from current level
//     currentQuestionData = currentLevelQueue.pop();

//     if (currentQuestionData.type === "mcq") {
//         qText.textContent = `[Level ${currentLevel}] ${currentQuestionData.question}`;
        
//         currentQuestionData.options.forEach((option, index) => {
//             const btn = document.createElement("button");
//             btn.textContent = option;
//             btn.style.cssText = "background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 10px; font-size: 15px; cursor: pointer; font-weight: 500; transition: 0.2s; color: #334155;";
            
//             btn.onmouseover = () => btn.style.background = "#f1f5f9";
//             btn.onmouseout = () => { if(!btn.disabled) btn.style.background = "#f8fafc"; };
//             btn.onclick = () => checkMcqAnswer(index, btn);
            
//             optContainer.appendChild(btn);
//         });
//     } else if (currentQuestionData.type === "puzzle") {
//         qText.textContent = `[Level ${currentLevel}] ${currentQuestionData.question}`;
        
//         optContainer.style.display = "flex";
//         optContainer.style.flexDirection = "column";
//         optContainer.style.gap = "12px";

//         const inputField = document.createElement("input");
//         inputField.type = "text";
//         inputField.placeholder = `Hint: ${currentQuestionData.hint}`;
//         inputField.id = "puzzle-input";
//         inputField.style.cssText = "width: 100%; padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 16px; text-align: center; font-weight: bold; text-transform: uppercase; box-sizing: border-box;";
//         inputField.onkeyup = (e) => { if(e.key === 'Enter') submitBtn.click(); };

//         const submitBtn = document.createElement("button");
//         submitBtn.textContent = "Verify Answer 🗝️";
//         submitBtn.style.cssText = "background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 15px;";
//         submitBtn.onclick = () => checkPuzzleAnswer(inputField, submitBtn);
        
//         optContainer.appendChild(inputField);
//         optContainer.appendChild(submitBtn);
        
//         setTimeout(() => inputField.focus(), 50);
//     }
// }

// 3. ANSWER VALIDATION (MCQ)
// function checkMcqAnswer(selectedIndex, clickedBtn) {
//     const optContainer = document.getElementById("arcade-options-container");
//     const nextBtn = document.getElementById("arcade-next-btn");
//     const scoreElement = document.getElementById("arcade-score");
    
//     const buttons = optContainer.querySelectorAll("button");
//     buttons.forEach(btn => btn.disabled = true);

//     if (selectedIndex === currentQuestionData.answer) {
//         clickedBtn.style.cssText += "background: #dcfce7 !important; border-color: #22c55e !important; color: #15803d !important;";
//         arcadeScore += 10;
//         showToast("Correct! +10 HU Coins 🎉");
//     } else {
//         clickedBtn.style.cssText += "background: #fee2e2 !important; border-color: #ef4444 !important; color: #b91c1c !important;";
//         buttons[currentQuestionData.answer].style.cssText += "background: #dcfce7 !important; border-color: #22c55e !important;";
//         showToast("Oops! Incorrect 😢");
//     }

//     if(scoreElement) scoreElement.textContent = arcadeScore;
//     if (nextBtn) nextBtn.style.display = "inline-block";
// }

// 4. ANSWER VALIDATION (PUZZLE)
// function checkPuzzleAnswer(inputField, submitBtn) {
//     const nextBtn = document.getElementById("arcade-next-btn");
//     const scoreElement = document.getElementById("arcade-score");
//     const userAnswer = inputField.value.trim().toUpperCase();

//     if(userAnswer === "") return;

//     inputField.disabled = true;
//     submitBtn.disabled = true;

//     if (userAnswer === currentQuestionData.correctWord) {
//         inputField.style.cssText += "background: #dcfce7 !important; border-color: #22c55e !important; color: #15803d !important;";
//         arcadeScore += 15;
//         showToast("Puzzle Cracked! +15 HU Coins 🧩");
//     } else {
//         inputField.style.cssText += "background: #fee2e2 !important; border-color: #ef4444 !important; color: #b91c1c !important;";
//         inputField.value = `Wrong! Answer: ${currentQuestionData.correctWord}`;
//         showToast("Incorrect Puzzle! 💥");
//     }

//     if(scoreElement) scoreElement.textContent = arcadeScore;
//     if (nextBtn) nextBtn.style.display = "inline-block";
// }

// 5. NEXT BUTTON ENGINE ADVANCE
// function loadNextArcadeQuestionAndAdvance() {
//     // Agar current level ke saare 8 questions khatam ho gaye, toh level badhao
//     if (currentLevelQueue.length === 0) {
//         currentLevel++;
//     }
//     loadNextArcadeQuestion();
// }

// 6. TOTAL RESET RESET MATRIX
// function resetWholeArcadeGame() {
//     arcadeScore = 0;
//     currentLevel = 1;
//     currentLevelQueue = [];
//     const scoreElement = document.getElementById("arcade-score");
//     if(scoreElement) scoreElement.textContent = "0";
//     loadNextArcadeQuestion();
// }


function switchTab(tabName) {
  // 1. Saare pages se 'active' class hatayein aur unhe hide karein
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
    page.style.display = "none";
  });

  // 2. Target page dhoondhein aur use active karein
  const targetPage = document.getElementById(`page-${tabName}`);
  if (targetPage) {
    targetPage.classList.add("active");
    
    // Games (Arcade) page ko strictly FLEX layout dena taaki card stretch ho sake
    // if (tabName === "games") {
    //     targetPage.style.setProperty("display", "flex", "important");
    // } else {
    //     targetPage.style.setProperty("display", "block", "important");
    // }
  }

  // 3. Sidebar navigation links ka active status update karein
  document.querySelectorAll(".nav-item").forEach((nav) => {
    nav.classList.remove("active");
  });
  
  const activeNav = document.getElementById(`nav-${tabName}`);
  if (activeNav) {
    activeNav.classList.add("active");
  }
}

/* ==========================================================================
   🩺 HEALTHY UNIVERSE - GLOBAL DEEP UNDERSTANDING PROTOCOL MODAL
   ========================================================================== */

/**
 * Open the Deep Understanding Modal and load content based on topicKey
 */
window.openDeepUnderstanding = function(topicKey) {
  // Safe check for the global healthDataRepository
  if (!window.healthDataRepository || !window.healthDataRepository[topicKey]) {
    console.error(`Error: Topic key "${topicKey}" not found in healthDataRepository.`);
    return;
  }

  const data = window.healthDataRepository[topicKey];
  let modal = document.getElementById("deep-health-modal");
  
  // Dynamic Modal Structure Injection (if it doesn't already exist in the HTML)
  if (!modal) {
    const modalHtml = `
      <div id="deep-health-modal" style="
        display: none; 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(15, 23, 42, 0.65); 
        backdrop-filter: blur(4px);
        z-index: 99999; 
        justify-content: center; 
        align-items: center;
        padding: 16px;
        box-sizing: border-box;
      ">
        <div class="health-deep-card" style="
          background: #ffffff; 
          width: 100%;
          max-width: 600px; 
          padding: 28px; 
          border-radius: 16px; 
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-sizing: border-box;
        ">
          <button onclick="closeDeepModal()" style="
            position: absolute; 
            right: 20px; 
            top: 20px; 
            background: #f1f5f9; 
            border: none; 
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 16px; 
            cursor: pointer; 
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">✕</button>
          
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
            <span id="deep-emoji" style="
              font-size: 2rem; 
              background: #eff6ff; 
              padding: 10px; 
              border-radius: 12px;
              line-height: 1;
            "></span>
            <h2 id="deep-title" style="margin: 0; color: #0f172a; font-size: 1.4rem; font-weight: 700; font-family: inherit;"></h2>
          </div>
          
          <div class="deep-tabs-nav" style="
            display: flex; 
            gap: 6px; 
            border-bottom: 2px solid #f1f5f9; 
            margin-bottom: 20px; 
            padding-bottom: 2px;
          ">
            <button class="deep-tab-btn active" onclick="switchDeepTab('overview', this)" style="
              padding: 10px 16px; border: none; background: none; font-weight: 600; cursor: pointer; 
              color: #2563eb; border-bottom: 2px solid #2563eb; margin-bottom: -4px; font-size: 0.9rem; transition: all 0.2s;
            ">Science & Blueprint</button>
            <button class="deep-tab-btn" onclick="switchDeepTab('clinical', this)" style="
              padding: 10px 16px; border: none; background: none; font-weight: 600; cursor: pointer; 
              color: #64748b; margin-bottom: -4px; font-size: 0.9rem; transition: all 0.2s;
            ">Clinical Insights</button>
            <button class="deep-tab-btn" onclick="switchDeepTab('resources', this)" style="
              padding: 10px 16px; border: none; background: none; font-weight: 600; cursor: pointer; 
              color: #64748b; margin-bottom: -4px; font-size: 0.9rem; transition: all 0.2s;
            ">Research Journals</button>
          </div>
          
          <div id="deep-body-content" style="
            max-height: 380px; 
            overflow-y: auto; 
            color: #334155; 
            line-height: 1.6; 
            font-size: 0.95rem; 
            padding-right: 6px;
          "></div>
        </div>
      </div>

      <style>
        @keyframes modalSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        #deep-body-content::-webkit-scrollbar {
          width: 6px;
        }
        #deep-body-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        #deep-body-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        #deep-body-content ul {
          padding-left: 20px;
          margin-top: 8px;
        }
        #deep-body-content li {
          margin-bottom: 10px;
        }
        #deep-body-content h4 {
          color: #1e293b;
          font-size: 1.1rem;
          margin-top: 18px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .research-card {
          background: #f8fafc;
          border-left: 4px solid #10b981;
          padding: 16px;
          border-radius: 0 8px 8px 0;
          margin-top: 10px;
        }
      </style>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    modal = document.getElementById("deep-health-modal");
  }

  // Save current active topic data globally
  window.currentDeepTopic = data;

  // Set initial content
  document.getElementById("deep-emoji").textContent = data.emoji;
  document.getElementById("deep-title").textContent = data.title;
  
  // Set default tab on open
  const defaultTabBtn = modal.querySelector(".deep-tab-btn");
  window.switchDeepTab('overview', defaultTabBtn);

  // Open modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // background scroll lock

  // Close modal when clicking outside of modal card
  modal.onclick = function(e) {
    if (e.target === modal) {
      window.closeDeepModal();
    }
  };
}

/**
 * Close the Deep Understanding Modal
 */
window.closeDeepModal = function() {
  const modal = document.getElementById("deep-health-modal");
  if (modal) {
    modal.style.display = "none";
  }
  document.body.style.overflow = ""; // restore background scroll
}

/**
 * Switch tabs dynamically inside the modal
 */
window.switchDeepTab = function(tabType, clickedBtn) {
  const data = window.currentDeepTopic;
  if (!data) return;

  // Visual active tab update
  if (clickedBtn) {
    document.querySelectorAll(".deep-tab-btn").forEach((btn) => {
      btn.style.color = "#64748b";
      btn.style.borderBottom = "none";
    });
    clickedBtn.style.color = "#2563eb";
    clickedBtn.style.borderBottom = "2px solid #2563eb";
  }

  // Content loader update
  const bodyContainer = document.getElementById("deep-body-content");
  if (bodyContainer) {
    bodyContainer.innerHTML = data[tabType] || "<p>No active protocol registered under this tab.</p>";
  }
}

// Setup Escape key listener for fast closing
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.closeDeepModal();
  }
});

/**
 * Close the Deep Understanding Modal
 */
window.closeDeepModal = function() {
  const modal = document.getElementById("deep-health-modal");
  if (modal) {
    modal.style.display = "none";
  }
  document.body.style.overflow = ""; // restore background scroll
};

/**
 * Switch tabs dynamically inside the modal
 */
window.switchDeepTab = function(tabType, clickedBtn) {
  const data = window.currentDeepTopic;
  if (!data) return;

  // Visual active tab update
  if (clickedBtn) {
    document.querySelectorAll(".deep-tab-btn").forEach((btn) => {
      btn.style.color = "#64748b";
      btn.style.borderBottom = "none";
    });
    clickedBtn.style.color = "#2563eb";
    clickedBtn.style.borderBottom = "2px solid #2563eb";
  }

  // Content loader update
  const bodyContainer = document.getElementById("deep-body-content");
  if (bodyContainer) {
    bodyContainer.innerHTML = data[tabType] || "<p>No active protocol registered under this tab.</p>";
  }
};

// Setup Escape key listener for fast closing
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.closeDeepModal();
    window.closePostJobModal();
  }
});

/* ============================
   POST JOB MODAL
============================ */

window.openPostJobModal = function () {
  if (!huGetToken()) {
    showToast("⚠️ Please log in to post a job");
    return;
  }
  const modal = document.getElementById("post-job-modal");

  if (!modal) {
    console.error("Post Job Modal not found!");
    return;
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
};

window.closePostJobModal = function () {
    const modal = document.getElementById("post-job-modal");

    if (!modal) return;

    modal.style.display = "none";
    document.body.style.overflow = "";

    const form = document.getElementById("post-job-form");
    if (form) form.reset();
};


/* ============================
   Escape HTML
============================ */

function escapeHTML(text) {
    const div = document.createElement("div");
    div.innerText = text || "";
    return div.innerHTML;
}


/* ============================
   Build Job Card
============================ */

function buildJobCard(job) {

    const tags = job.tags
        .map(tag => `<span class="job-tag">${escapeHTML(tag)}</span>`)
        .join("");

    return `

<div class="job-card">

<div class="job-card-header">

<div class="job-info-main">

<div class="hospital-logo">🏥</div>

<div>

<h3>${escapeHTML(job.title)}</h3>

<p>
<strong>${escapeHTML(job.hospital)}</strong> •
${escapeHTML(job.location)}
</p>

<div class="job-badges">
<span class="badge badge-primary">${escapeHTML(job.type)}</span>
<span class="badge">${escapeHTML(job.specialty)}</span>

${
job.experience
?
`<span class="badge">${escapeHTML(job.experience)}</span>`
:
""
}

</div>

</div>

</div>

</div>

<p class="job-description">
${escapeHTML(job.description)}
</p>

<div class="job-tags-container">
${tags}
</div>

<div class="job-card-footer">

<div>

<strong>${escapeHTML(job.salary || "Negotiable")}</strong>

${
job.deadline
?
`<div>Deadline : ${escapeHTML(job.deadline)}</div>`
:
""
}

</div>

<button class="btn-primary">
Apply Now
</button>

</div>

</div>

`;
}


/* ============================
   Publish Job
============================ */

window.handlePostJobSubmit = async function (event) {
  event.preventDefault();

  const title = document.getElementById("job-title").value.trim();
  const company = document.getElementById("job-hospital").value.trim();
  const location = document.getElementById("job-location").value.trim();
  const jobType = document.getElementById("job-type").value;
  const specialty = document.getElementById("job-specialty").value.trim();
  const experience = document.getElementById("job-experience").value.trim();
  const salary = document.getElementById("job-salary").value.trim();
  const description = document.getElementById("job-description").value.trim();
  const tags = document
    .getElementById("job-tags")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const deadline = document.getElementById("job-deadline").value;

  if (!title || !company || !description) {
    showToast("⚠️ Please fill in job title, hospital, and description");
    return;
  }

  const payload = {
    title: title,
    company: company,
    location: location || "Remote",
    job_type: jobType,
    specialty: specialty || "General Physician",
    salary: salary,
    experience: experience,
    deadline: deadline,
    tags: tags,
    description: description,
  };

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting…";
  }

  try {
    const res = await huFetch("/api/jobs/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) {
      showToast("❌ " + (data.detail || "Could not post job"));
      return;
    }

    JOBS.unshift(data);
    renderJobs();

    closePostJobModal();
    showToast("✅ Job posted successfully!");
  } catch (e) {
    showToast("❌ Could not connect to server");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish Job";
    }
  }
};


// Open Specialty Modal
function openSpecialtyModal() {
  const modal = document.getElementById('specialtyModal');
  if (modal) {
    modal.classList.add('open');
  }
}

// Close Specialty Modal
function closeSpecialtyModal() {
  const modal = document.getElementById('specialtyModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// Close when clicking outside modal box
window.addEventListener('click', function(event) {
  const modal = document.getElementById('specialtyModal');
  if (event.target === modal) {
    modal.classList.remove('open');
  }
});

// Select specialty from modal
function selectModalSpecialty(specialtyValue) {
  document.querySelectorAll('.specialty-pill').forEach(pill => {
    pill.classList.remove('active');
  });

  const moreBtn = document.getElementById('morePillBtn');
  if (moreBtn) {
    moreBtn.innerText = `✓ ${specialtyValue}`;
    moreBtn.classList.add('active');
  }

  if (typeof filterBySpecialty === 'function') {
    filterBySpecialty(specialtyValue, moreBtn);
  }

  closeSpecialtyModal();
}

// Search functionality
function searchSpecialties() {
  const input = document.getElementById('specialtySearch').value.toLowerCase();
  const buttons = document.getElementById('modalSpecialtyList').getElementsByTagName('button');

  for (let btn of buttons) {
    const text = btn.innerText.toLowerCase();
    btn.style.display = text.includes(input) ? 'block' : 'none';
  }
}


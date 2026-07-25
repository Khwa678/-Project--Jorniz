// ============================================
// HEALTHY UNIVERSE - ADMIN PANEL (admin.js)
// ============================================

async function checkAdminAccess() {
  const res = await huFetch("/api/admin/check");
  const btn = document.getElementById("admin-nav-btn");
  if (res && res.ok) {
    btn.style.display = "flex";
    return true;
  }
  btn.style.display = "none";
  return false;
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll(".admin-tab").forEach(function (b) {
    b.classList.remove("active");
  });
  btn.classList.add("active");
  document.querySelectorAll(".admin-tab-panel").forEach(function (p) {
    p.classList.remove("active");
  });
  document.getElementById("admin-tab-" + tab).classList.add("active");

  if (tab === "users") loadAdminUsers();
  else if (tab === "posts") loadAdminPosts();
  else if (tab === "reports") loadAdminReports();
  else if (tab === "ads") loadAdminAds();
  else if (tab === "content") loadAdminTopics();
  else if (tab === "jobs") loadAdminJobs();
  else if (tab === "doctors") loadAdminDoctors();
}

// ── Users ──────────────────────────────────────────────────────────────────
async function loadAdminUsers() {
  const list = document.getElementById("admin-users-list");
  list.innerHTML = '<p class="admin-loading">Loading users...</p>';
  const res = await huFetch("/api/admin/users");
  if (!res || !res.ok) {
    list.innerHTML = '<p class="admin-loading">Could not load users</p>';
    return;
  }
  const users = await res.json();

  if (users.length === 0) {
    list.innerHTML = '<p class="admin-loading">No users found</p>';
    return;
  }

  list.innerHTML = users
    .map(function (u) {
      return (
        '<div class="admin-row">' +
        '<div class="admin-row-info">' +
        "<strong>" +
        u.name +
        (u.is_banned ? ' <span class="admin-badge banned">Banned</span>' : "") +
        "</strong>" +
        "<span>" +
        u.email +
        " · " +
        (u.specialty || "Member") +
        "</span>" +
        "</div>" +
        '<div class="admin-row-actions">' +
        '<button class="admin-action-btn" onclick="toggleUserBan(\'' +
        u.id +
        "')\">" +
        (u.is_banned ? "Unban" : "Ban") +
        "</button>" +
        '<button class="admin-action-btn danger" onclick="deleteAdminUser(\'' +
        u.id +
        "')\">Delete</button>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

async function toggleUserBan(userId) {
  const res = await huFetch("/api/admin/users/" + userId + "/ban", {
    method: "POST",
  });
  if (res && res.ok) {
    showToast("✅ Updated");
    loadAdminUsers();
  }
}

async function deleteAdminUser(userId) {
  if (!confirm("Permanently delete this user and all their data?")) return;
  const res = await huFetch("/api/admin/users/" + userId, { method: "DELETE" });
  if (res && res.ok) {
    showToast("🗑️ User deleted");
    loadAdminUsers();
  }
}

// ── Posts ──────────────────────────────────────────────────────────────────
async function loadAdminPosts() {
  const list = document.getElementById("admin-posts-list");
  list.innerHTML = '<p class="admin-loading">Loading posts...</p>';
  const res = await huFetch("/api/admin/posts");
  if (!res || !res.ok) {
    list.innerHTML = '<p class="admin-loading">Could not load posts</p>';
    return;
  }
  const posts = await res.json();

  if (posts.length === 0) {
    list.innerHTML = '<p class="admin-loading">No posts found</p>';
    return;
  }

  list.innerHTML = posts
    .map(function (p) {
      const author = p.author || {};
      return (
        '<div class="admin-row">' +
        '<div class="admin-row-info">' +
        "<strong>" +
        (author.name || "Unknown") +
        "</strong>" +
        "<span>" +
        (p.content || "").slice(0, 80) +
        "</span>" +
        "</div>" +
        '<div class="admin-row-actions">' +
        '<button class="admin-action-btn danger" onclick="deleteAdminPost(\'' +
        p.id +
        "')\">Delete</button>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

async function deleteAdminPost(postId) {
  if (!confirm("Delete this post?")) return;
  const res = await huFetch("/api/admin/posts/" + postId, { method: "DELETE" });
  if (res && res.ok) {
    showToast("🗑️ Post deleted");
    loadAdminPosts();
  }
}

// ── Reports ────────────────────────────────────────────────────────────────
async function loadAdminReports() {
  const list = document.getElementById("admin-reports-list");
  list.innerHTML = '<p class="admin-loading">Loading reports...</p>';
  const res = await huFetch("/api/admin/reports");
  if (!res || !res.ok) {
    list.innerHTML = '<p class="admin-loading">Could not load reports</p>';
    return;
  }
  const reports = await res.json();

  if (reports.length === 0) {
    list.innerHTML = '<p class="admin-loading">No reports yet</p>';
    return;
  }

  list.innerHTML = reports
    .map(function (r) {
      return (
        '<div class="admin-row">' +
        '<div class="admin-row-info">' +
        "<strong>" +
        r.target_type.toUpperCase() +
        " reported" +
        (r.status === "resolved"
          ? ' <span class="admin-badge resolved">Resolved</span>'
          : ' <span class="admin-badge pending">Pending</span>') +
        "</strong>" +
        "<span>By " +
        r.reporter_name +
        " · " +
        (r.reason || "No reason given") +
        "</span>" +
        "</div>" +
        '<div class="admin-row-actions">' +
        (r.status !== "resolved"
          ? '<button class="admin-action-btn" onclick="resolveReport(\'' +
            r.id +
            "')\">Mark Resolved</button>"
          : "") +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

async function resolveReport(reportId) {
  const res = await huFetch("/api/admin/reports/" + reportId + "/resolve", {
    method: "POST",
  });
  if (res && res.ok) {
    showToast("✅ Report resolved");
    loadAdminReports();
  }
}

// ── Ads Approval ────────────────────────────────────────────────────────────
async function loadAdminAds() {
  const list = document.getElementById("admin-ads-list");
  list.innerHTML = '<p class="admin-loading">Loading campaigns...</p>';
  const res = await huFetch("/api/admin/campaigns");
  if (!res || !res.ok) {
    list.innerHTML = '<p class="admin-loading">Could not load campaigns</p>';
    return;
  }
  const campaigns = await res.json();

  if (campaigns.length === 0) {
    list.innerHTML = '<p class="admin-loading">No campaigns yet</p>';
    return;
  }

  list.innerHTML = campaigns
    .map(function (c) {
      const statusBadge =
        c.status === "active"
          ? '<span class="admin-badge resolved">Active</span>'
          : c.status === "rejected"
            ? '<span class="admin-badge banned">Rejected</span>'
            : c.status === "paused"
              ? '<span class="admin-badge pending">Paused</span>'
              : '<span class="admin-badge pending">Pending Review</span>';
      return (
        '<div class="admin-row">' +
        '<div class="admin-row-info">' +
        "<strong>" +
        c.name +
        " " +
        statusBadge +
        "</strong>" +
        "<span>By " +
        c.advertiser_name +
        " · Budget $" +
        parseFloat(c.budget).toFixed(2) +
        "</span>" +
        "</div>" +
        '<div class="admin-row-actions">' +
        (c.status === "pending"
          ? '<button class="admin-action-btn" onclick="approveCampaignAdmin(\'' +
            c.id +
            '\')">Approve</button><button class="admin-action-btn danger" onclick="rejectCampaignAdmin(\'' +
            c.id +
            "')\">Reject</button>"
          : "") +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

async function approveCampaignAdmin(id) {
  const res = await huFetch("/api/admin/campaigns/" + id + "/approve", {
    method: "POST",
  });
  if (res && res.ok) {
    showToast("✅ Campaign approved");
    loadAdminAds();
  }
}

async function rejectCampaignAdmin(id) {
  const res = await huFetch("/api/admin/campaigns/" + id + "/reject", {
    method: "POST",
  });
  if (res && res.ok) {
    showToast("🚫 Campaign rejected");
    loadAdminAds();
  }
}

// ── Site Content: Trending Topics ────────────────────────────────────────────
async function loadAdminTopics() {
  const list = document.getElementById("admin-topics-list");
  list.innerHTML = '<p class="admin-loading">Loading topics...</p>';
  const res = await fetch(HU_API + "/api/trending-topics");
  if (!res.ok) {
    list.innerHTML = '<p class="admin-loading">Could not load topics</p>';
    return;
  }
  const topics = await res.json();

  if (topics.length === 0) {
    list.innerHTML = '<p class="admin-loading">No custom topics yet</p>';
    return;
  }

  list.innerHTML = topics
    .map(function (t) {
      return (
        '<div class="admin-row">' +
        '<div class="admin-row-info"><strong>' +
        t.hashtag +
        "</strong><span>" +
        t.post_count +
        " posts</span></div>" +
        '<div class="admin-row-actions"><button class="admin-action-btn danger" onclick="deleteTopicAdmin(\'' +
        t.id +
        "')\">Delete</button></div>" +
        "</div>"
      );
    })
    .join("");
}

function openAddTopicForm() {
  document.getElementById("admin-add-topic-form").style.display = "flex";
}
function closeAddTopicForm() {
  document.getElementById("admin-add-topic-form").style.display = "none";
  document.getElementById("admin-topic-hashtag").value = "";
  document.getElementById("admin-topic-count").value = "";
}

async function submitNewTopic() {
  const hashtag = document.getElementById("admin-topic-hashtag").value.trim();
  const count =
    document.getElementById("admin-topic-count").value.trim() || "0";
  if (!hashtag) {
    showToast("⚠️ Enter a hashtag");
    return;
  }

  const res = await huFetch("/api/admin/trending-topics", {
    method: "POST",
    body: JSON.stringify({ hashtag: hashtag, post_count: count }),
  });
  if (res && res.ok) {
    showToast("✅ Topic added");
    closeAddTopicForm();
    loadAdminTopics();
  }
}

async function deleteTopicAdmin(id) {
  const res = await huFetch("/api/admin/trending-topics/" + id, {
    method: "DELETE",
  });
  if (res && res.ok) {
    showToast("🗑️ Topic deleted");
    loadAdminTopics();
  }
}
// ── Jobs ───────────────────────────────────────────────────────────────────
function openAddJobForm() { document.getElementById("admin-add-job-form").style.display = "flex"; }
function closeAddJobForm() { document.getElementById("admin-add-job-form").style.display = "none"; }

async function loadAdminJobs() {
  const list = document.getElementById("admin-jobs-list");
  list.innerHTML = '<p class="admin-loading">Loading jobs...</p>';
  const res = await huFetch("/api/admin/jobs");
  if (!res || !res.ok) { list.innerHTML = '<p class="admin-loading">Could not load</p>'; return; }
  const jobs = await res.json();
  if (jobs.length === 0) { list.innerHTML = '<p class="admin-loading">No jobs added yet</p>'; return; }
  list.innerHTML = jobs.map(function (j) {
    return '<div class="admin-row"><div class="admin-row-info"><strong>' + j.title +
      '</strong><span>' + j.company + ' · ' + j.location + ' · ' + j.type + '</span></div>' +
      '<div class="admin-row-actions"><button class="admin-action-btn danger" onclick="deleteAdminJob(\'' + j.id + '\')">Delete</button></div></div>';
  }).join("");
}

// async function submitNewJob() {
//   const title = document.getElementById("job-title").value.trim();
//   const company = document.getElementById("job-company").value.trim();
//   if (!title || !company) { showToast("⚠️ Title and company required"); return; }
//   const tagsRaw = document.getElementById("job-tags").value.trim();
//   const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

//   const res = await huFetch("/api/admin/jobs", {
//     method: "POST",
//     body: JSON.stringify({
//       title, company,
//       company_logo: document.getElementById("job-logo").value.trim(),
//       location: document.getElementById("job-location").value.trim() || "Remote",
//       job_type: document.getElementById("job-type").value,
//       specialty: document.getElementById("job-specialty").value,
//       salary: document.getElementById("job-salary").value.trim(),
//       experience: document.getElementById("job-experience").value.trim(),
//       deadline: document.getElementById("job-deadline").value.trim(),
//       tags,
//       description: document.getElementById("job-description").value.trim(),
//       featured: document.getElementById("job-featured").checked,
//     }),
//   });
//   if (res && res.ok) { showToast("✅ Job posted"); closeAddJobForm(); loadAdminJobs(); }
// }

async function submitNewJob() {
  const title = document.getElementById("adm-job-title").value.trim();
  const company = document.getElementById("adm-job-company").value.trim();
  if (!title || !company) {
    showToast("⚠️ Title and company required");
    return;
  }
  const tagsRaw = document.getElementById("adm-job-tags").value.trim();
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const res = await huFetch("/api/admin/jobs", {
    method: "POST",
    body: JSON.stringify({
      title,
      company,
      company_logo: document.getElementById("adm-job-logo").value.trim(),
      location:
        document.getElementById("adm-job-location").value.trim() || "Remote",
      job_type: document.getElementById("adm-job-type").value,
      specialty: document.getElementById("adm-job-specialty").value,
      salary: document.getElementById("adm-job-salary").value.trim(),
      experience: document.getElementById("adm-job-experience").value.trim(),
      deadline: document.getElementById("adm-job-deadline").value.trim(),
      tags,
      description: document.getElementById("adm-job-description").value.trim(),
      featured: document.getElementById("adm-job-featured").checked,
    }),
  });
  if (res && res.ok) {
    showToast("✅ Job posted");
    closeAddJobForm();
    loadAdminJobs();
  }
}

async function deleteAdminJob(id) {
  if (!confirm("Delete this job?")) return;
  const res = await huFetch("/api/admin/jobs/" + id, { method: "DELETE" });
  if (res && res.ok) { showToast("🗑️ Deleted"); loadAdminJobs(); }
}

// ── Doctors / Consultations ─────────────────────────────────────────────────
function openAddDoctorForm() { document.getElementById("admin-add-doctor-form").style.display = "flex"; }
function closeAddDoctorForm() { document.getElementById("admin-add-doctor-form").style.display = "none"; }

async function loadAdminDoctors() {
  const list = document.getElementById("admin-doctors-list");
  list.innerHTML = '<p class="admin-loading">Loading doctors...</p>';
  const res = await huFetch("/api/admin/doctors");
  if (!res || !res.ok) { list.innerHTML = '<p class="admin-loading">Could not load</p>'; return; }
  const docs = await res.json();
  if (docs.length === 0) { list.innerHTML = '<p class="admin-loading">No doctors added yet</p>'; return; }
  list.innerHTML = docs.map(function (d) {
    return '<div class="admin-row"><div class="admin-row-info"><strong>' + d.name +
      '</strong><span>' + d.specialty + ' · ₹' + d.price + '</span></div>' +
      '<div class="admin-row-actions"><button class="admin-action-btn danger" onclick="deleteAdminDoctor(\'' + d.id + '\')">Delete</button></div></div>';
  }).join("");
}

async function submitNewDoctor() {
  const name = document.getElementById("doc-name").value.trim();
  if (!name) { showToast("⚠️ Enter doctor name"); return; }
  const tagsRaw = document.getElementById("doc-tags").value.trim();
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  const res = await huFetch("/api/admin/doctors", {
    method: "POST",
    body: JSON.stringify({
      name,
      specialty: document.getElementById("doc-specialty").value,
      hospital: document.getElementById("doc-hospital").value.trim(),
      avatar_url: document.getElementById("doc-avatar").value.trim(),
      experience: document.getElementById("doc-experience").value || 0,
      rating: document.getElementById("doc-rating").value || 4.8,
      reviews: document.getElementById("doc-reviews").value || 0,
      consultations: document.getElementById("doc-consultations").value || 0,
      status: document.getElementById("doc-status").value,
      price: document.getElementById("doc-price").value || 0,
      coins: document.getElementById("doc-coins").value || "",
      next_slot: document.getElementById("doc-nextslot").value.trim() || "Available Now",
      tags,
    }),
  });
  if (res && res.ok) { showToast("✅ Doctor added"); closeAddDoctorForm(); loadAdminDoctors(); }
}

async function deleteAdminDoctor(id) {
  if (!confirm("Remove this doctor?")) return;
  const res = await huFetch("/api/admin/doctors/" + id, { method: "DELETE" });
  if (res && res.ok) { showToast("🗑️ Removed"); loadAdminDoctors(); }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(checkAdminAccess, 800);
});

const adminOriginalNavigate = navigate;
navigate = function (pageId, clickedBtn) {
  adminOriginalNavigate(pageId, clickedBtn);
  if (pageId === "admin") loadAdminUsers();
};

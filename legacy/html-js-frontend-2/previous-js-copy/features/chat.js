// ============================================
// HEALTHY UNIVERSE - MESSAGING ENGINE (chat.js)
// Full version: media, reply, edit, delete, pin, block, search, voice
// ============================================

let hcSocket = null;
let hcCurrentConversationId = null;
let hcCurrentOtherUser = null;
let hcAllConversations = [];
let hcTypingTimeout = null;
let hcOpenRequestToken = 0;
let hcIsLoadingConversations = false;
let hcPendingMediaFile = null;
let hcReplyingToMessage = null;
let hcVoiceRecorder = null;
let hcVoiceChunks = [];
let hcVoiceStream = null;
let hcIsRecordingVoice = false;

function hcConnectSocket() {
  const token = huGetToken();
  if (!token) return;

  hcSocket = io(HU_API, {
    query: { token: token },
    transports: ["websocket", "polling"],
  });

  hcSocket.on("connect", function () {
    console.log("Chat socket connected");
  });

  hcSocket.on("new_message", function (msg) {
    if (msg.conversation_id === hcCurrentConversationId) {
      hcAppendMessage(msg);
      hcMarkCurrentConversationRead();
    }
    renderConversationsList();
  });

  hcSocket.on("conversation_update", function () {
    renderConversationsList();
  });

  hcSocket.on("presence", function (data) {
    if (hcCurrentOtherUser && data.user_id === hcCurrentOtherUser.id) {
      const statusEl = document.getElementById("chat-header-status");
      if (statusEl) statusEl.textContent = data.online ? "Online" : "Offline";
    }
    renderConversationsList();
  });

  hcSocket.on("typing", function (data) {
    if (data.conversation_id === hcCurrentConversationId) {
      const indicator = document.getElementById("chat-typing-indicator");
      if (indicator) {
        indicator.style.display = "block";
        clearTimeout(window.hcTypingHideTimeout);
        window.hcTypingHideTimeout = setTimeout(function () {
          indicator.style.display = "none";
        }, 2000);
      }
    }
  });

  hcSocket.on("messages_read", function (data) {
    if (data.conversation_id === hcCurrentConversationId) {
      document
        .querySelectorAll(".chat-msg.mine .chat-msg-status")
        .forEach(function (el) {
          el.textContent = "Read";
        });
    }
  });

  hcSocket.on("message_edited", function (data) {
    const bubble = document.querySelector(
      '.chat-msg[data-msg-id="' + data.message_id + '"] .chat-msg-bubble',
    );
    if (bubble) {
      const textNode = bubble.querySelector(".chat-msg-text") || bubble;
      textNode.textContent = data.content;
      if (!bubble.querySelector(".chat-msg-edited-tag")) {
        bubble.insertAdjacentHTML(
          "beforeend",
          '<span class="chat-msg-edited-tag"> (edited)</span>',
        );
      }
    }
  });

  hcSocket.on("message_deleted", function (data) {
    const msgEl = document.querySelector(
      '.chat-msg[data-msg-id="' + data.message_id + '"]',
    );
    if (msgEl) {
      msgEl.querySelector(".chat-msg-bubble").innerHTML =
        '<em class="chat-msg-deleted">This message was deleted</em>';
    }
  });

  hcSocket.on("message_blocked", function () {
    showToast("You can't message this user");
  });
}

async function renderConversationsList() {
  const list = document.getElementById("conversations-list");
  if (!list) return;
  if (hcIsLoadingConversations) return;
  hcIsLoadingConversations = true;

  const res = await huFetch("/api/messages/conversations");
  if (!res || !res.ok) {
    list.innerHTML =
      '<p style="padding:16px;color:var(--muted);font-size:13px;">Could not load conversations</p>';
    hcIsLoadingConversations = false;
    return;
  }
  hcAllConversations = await res.json();

  updateUnreadDot();

  if (hcAllConversations.length === 0) {
    list.innerHTML =
      '<div class="no-conv-msg"><div class="no-conv-icon">\u{1F4AC}</div><p>No conversations yet</p><span>Tap "+ New" above to message a colleague</span></div>';
    hcIsLoadingConversations = false;
    return;
  }

  list.innerHTML = hcAllConversations
    .map(function (c) {
      const u = c.other_user;
      const avatar = getLetterAvatar(u.name, 80);
      const timeStr = c.last_time ? hcFormatTime(c.last_time) : "";
      const activeClass = c.id === hcCurrentConversationId ? "active" : "";
      const pinnedClass = c.is_pinned ? "pinned" : "";
      let previewText = c.last_message || "Start the conversation";
      if (!c.last_message && c.last_media_type) {
        previewText =
          c.last_media_type === "image"
            ? "Photo"
            : c.last_media_type === "video"
              ? "Video"
              : "Voice message";
      } else if (c.last_media_type && c.last_message) {
        previewText = c.last_message;
      }
      return (
        '<div class="conv-row ' +
        activeClass +
        " " +
        pinnedClass +
        '" onclick="openConversation(\'' +
        c.id +
        "')\" oncontextmenu=\"showConvContextMenu(event, '" +
        c.id +
        "'); return false;\">" +
        (c.is_pinned ? '<span class="conv-pin-icon">\u{1F4CC}</span>' : "") +
        '<div class="conv-avatar-wrap">' +
        '<img src="' +
        avatar +
        '" alt="' +
        u.name +
        '"/>' +
        '<span class="conv-online-dot ' +
        (u.online ? "online" : "") +
        '"></span>' +
        "</div>" +
        '<div class="conv-info">' +
        '<div class="conv-name-row"><span class="conv-name">' +
        u.name +
        '</span><span class="conv-time">' +
        timeStr +
        "</span></div>" +
        '<div class="conv-preview-row"><span class="conv-preview">' +
        previewText +
        "</span>" +
        (c.unread_count > 0
          ? '<span class="conv-unread-badge">' + c.unread_count + "</span>"
          : "") +
        "</div>" +
        "</div>" +
        '<button class="conv-pin-toggle" onclick="event.stopPropagation(); togglePinConversation(\'' +
        c.id +
        '\')" title="' +
        (c.is_pinned ? "Unpin" : "Pin") +
        '">\u{1F4CC}</button>' +
        "</div>"
      );
    })
    .join("");

  hcIsLoadingConversations = false;
}

function updateUnreadDot() {
  const total = hcAllConversations.reduce(function (s, c) {
    return s + (c.unread_count || 0);
  }, 0);
  const dot = document.getElementById("msg-notif-dot");
  if (dot) dot.style.display = total > 0 ? "block" : "none";
}

function filterConversations(query) {
  const q = query.toLowerCase();
  document.querySelectorAll(".conv-row").forEach(function (row) {
    const name = row.querySelector(".conv-name").textContent.toLowerCase();
    row.style.display = name.includes(q) ? "" : "none";
  });
}

async function togglePinConversation(convId) {
  const res = await huFetch("/api/messages/conversations/" + convId + "/pin", {
    method: "POST",
  });
  if (res && res.ok) {
    renderConversationsList();
  }
}

function showConvContextMenu(event, convId) {
  event.preventDefault();
  togglePinConversation(convId);
}

async function openConversation(convId) {
  hcOpenRequestToken += 1;
  const myToken = hcOpenRequestToken;

  hcCurrentConversationId = convId;
  hcReplyingToMessage = null;
  clearReplyPreview();

  const conv = hcAllConversations.find(function (c) {
    return c.id === convId;
  });
  hcCurrentOtherUser = conv ? conv.other_user : null;

  document.getElementById("chat-empty-state").style.display = "none";
  document.getElementById("chat-active").style.display = "flex";
  document.getElementById("chat-search-bar").style.display = "none";
  document.getElementById("chat-header-menu").style.display = "none";

  if (hcCurrentOtherUser) {
    document.getElementById("chat-header-avatar").src = getLetterAvatar(
      hcCurrentOtherUser.name,
      80,
    );
    document.getElementById("chat-header-name").textContent =
      hcCurrentOtherUser.name;
    document.getElementById("chat-header-status").textContent =
      hcCurrentOtherUser.online ? "Online" : "Offline";
    document.getElementById("chat-block-btn").textContent =
      hcCurrentOtherUser.blocked_by_me ? "Unblock user" : "Block user";
    document.getElementById("chat-blocked-banner").style.display =
      hcCurrentOtherUser.blocked_by_me ? "block" : "none";
  }

  const messagesContainer = document.getElementById("chat-messages");
  messagesContainer.innerHTML =
    '<p style="text-align:center;color:var(--muted);padding:20px;">Loading messages...</p>';

  if (hcSocket) hcSocket.emit("join_conversation", { conversation_id: convId });

  const res = await huFetch(
    "/api/messages/conversations/" + convId + "/messages",
  );

  if (myToken !== hcOpenRequestToken || hcCurrentConversationId !== convId)
    return;

  messagesContainer.innerHTML = "";

  if (res && res.ok) {
    const messages = await res.json();
    if (myToken !== hcOpenRequestToken || hcCurrentConversationId !== convId)
      return;
    let lastDateLabel = null;
    messages.forEach(function (m) {
      const dateLabel = hcFormatDateSeparator(m.created_at);
      if (dateLabel !== lastDateLabel) {
        insertDateSeparator(dateLabel);
        lastDateLabel = dateLabel;
      }
      hcAppendMessage(m);
    });
  }

  hcMarkCurrentConversationRead();
  renderConversationsList();
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hcMarkCurrentConversationRead() {
  if (hcSocket && hcCurrentConversationId) {
    hcSocket.emit("mark_read", { conversation_id: hcCurrentConversationId });
  }
}

function hcFormatDateSeparator(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function insertDateSeparator(label) {
  const container = document.getElementById("chat-messages");
  container.insertAdjacentHTML(
    "beforeend",
    '<div class="chat-date-separator"><span>' + label + "</span></div>",
  );
}

function hcMaybeInsertDateSeparatorForNewMessage(isoString) {
  const container = document.getElementById("chat-messages");
  const separators = container.querySelectorAll(".chat-date-separator span");
  const newLabel = hcFormatDateSeparator(isoString);
  const lastLabel = separators.length
    ? separators[separators.length - 1].textContent
    : null;
  if (newLabel !== lastLabel) {
    insertDateSeparator(newLabel);
  }
}

function hcAppendMessage(msg) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  hcMaybeInsertDateSeparatorForNewMessage(msg.created_at);

  const currentUser = huGetUser();
  const isMine =
    currentUser && String(msg.sender_id) === String(currentUser.id);
  const time = hcFormatTime(msg.created_at);

  if (msg.is_deleted) {
    const html =
      '<div class="chat-msg ' +
      (isMine ? "mine" : "theirs") +
      '" data-msg-id="' +
      msg.id +
      '">' +
      '<div class="chat-msg-bubble"><em class="chat-msg-deleted">This message was deleted</em></div>' +
      '<div class="chat-msg-meta"><span class="chat-msg-time">' +
      time +
      "</span></div>" +
      "</div>";
    container.insertAdjacentHTML("beforeend", html);
    container.scrollTop = container.scrollHeight;
    return;
  }

  let replyHtml = "";
  if (msg.reply_to) {
    replyHtml =
      '<div class="chat-reply-quote">' +
      hcEscapeHtml(msg.reply_to.content || "Media message") +
      "</div>";
  }

  let bodyHtml = "";
  if (msg.media_url) {
    const fullUrl = HU_API + msg.media_url;
    if (msg.media_type === "video") {
      bodyHtml =
        '<video src="' + fullUrl + '" controls class="chat-msg-media"></video>';
    } else if (msg.media_type === "audio") {
      bodyHtml =
        '<audio src="' + fullUrl + '" controls class="chat-msg-audio"></audio>';
    } else {
      bodyHtml = '<img src="' + fullUrl + '" class="chat-msg-media"/>';
    }
    if (msg.content) {
      bodyHtml +=
        '<div class="chat-msg-caption">' + hcEscapeHtml(msg.content) + "</div>";
    }
  } else {
    bodyHtml =
      '<span class="chat-msg-text">' +
      hcEscapeHtml(msg.content) +
      "</span>" +
      (msg.edited_at
        ? '<span class="chat-msg-edited-tag"> (edited)</span>'
        : "");
  }

  const bubbleClass = msg.media_url
    ? "chat-msg-bubble chat-msg-bubble-media"
    : "chat-msg-bubble";
  const replyPreviewText = (
    msg.content || (msg.media_type ? "Media message" : "")
  )
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");

  const html =
    '<div class="chat-msg ' +
    (isMine ? "mine" : "theirs") +
    '" data-msg-id="' +
    msg.id +
    '">' +
    '<div class="chat-msg-hover-actions">' +
    "<button onclick=\"setReplyTarget('" +
    replyPreviewText +
    "', '" +
    msg.id +
    '\')" title="Reply">\u21A9\uFE0F</button>' +
    (isMine && !msg.media_url
      ? "<button onclick=\"editMessagePrompt('" +
        msg.id +
        '\')" title="Edit">\u270F\uFE0F</button>'
      : "") +
    (isMine
      ? "<button onclick=\"deleteMessageConfirm('" +
        msg.id +
        '\')" title="Delete">\u{1F5D1}\uFE0F</button>'
      : "") +
    "</div>" +
    '<div class="' +
    bubbleClass +
    '">' +
    replyHtml +
    bodyHtml +
    "</div>" +
    '<div class="chat-msg-meta"><span class="chat-msg-time">' +
    time +
    "</span>" +
    (isMine
      ? '<span class="chat-msg-status">' +
        (msg.read_at ? "Read" : "Sent") +
        "</span>"
      : "") +
    "</div>" +
    "</div>";

  container.insertAdjacentHTML("beforeend", html);
  container.scrollTop = container.scrollHeight;
}

function hcEscapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function hcFormatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function setReplyTarget(contentPreview, messageId) {
  hcReplyingToMessage = { id: messageId, preview: contentPreview };
  const box = document.getElementById("chat-reply-preview");
  box.style.display = "flex";
  box.innerHTML =
    '<div class="chat-reply-preview-text">Replying to: <span>' +
    hcEscapeHtml(contentPreview.slice(0, 60)) +
    '</span></div><button onclick="clearReplyPreview()">\u2715</button>';
  document.getElementById("chat-input").focus();
}

function clearReplyPreview() {
  hcReplyingToMessage = null;
  const box = document.getElementById("chat-reply-preview");
  box.style.display = "none";
  box.innerHTML = "";
}

async function editMessagePrompt(messageId) {
  const msgEl = document.querySelector(
    '.chat-msg[data-msg-id="' + messageId + '"] .chat-msg-text',
  );
  const currentText = msgEl ? msgEl.textContent : "";
  const newText = prompt("Edit message:", currentText);
  if (newText === null || !newText.trim() || newText === currentText) return;

  const res = await huFetch("/api/messages/" + messageId, {
    method: "PUT",
    body: JSON.stringify({ content: newText.trim() }),
  });
  if (res && res.ok) {
    if (msgEl) msgEl.textContent = newText.trim();
  } else {
    showToast("Could not edit message");
  }
}

async function deleteMessageConfirm(messageId) {
  if (!confirm("Delete this message?")) return;
  const res = await huFetch("/api/messages/" + messageId, { method: "DELETE" });
  if (res && res.ok) {
    const msgEl = document.querySelector(
      '.chat-msg[data-msg-id="' + messageId + '"] .chat-msg-bubble',
    );
    if (msgEl)
      msgEl.innerHTML =
        '<em class="chat-msg-deleted">This message was deleted</em>';
  } else {
    showToast("Could not delete message");
  }
}

function sendChatMessage() {
  if (hcPendingMediaFile) {
    uploadAndSendMediaMessage();
    return;
  }
  const input = document.getElementById("chat-input");
  const content = input.value.trim();
  if (!content || !hcCurrentConversationId || !hcSocket) return;

  hcSocket.emit("send_message", {
    conversation_id: hcCurrentConversationId,
    content: content,
    reply_to_id: hcReplyingToMessage ? hcReplyingToMessage.id : null,
  });

  input.value = "";
  clearReplyPreview();
}

document.addEventListener("keydown", function (e) {
  if (
    e.key === "Enter" &&
    document.activeElement &&
    document.activeElement.id === "chat-input"
  ) {
    sendChatMessage();
  }
});

document.addEventListener("input", function (e) {
  if (
    e.target &&
    e.target.id === "chat-input" &&
    hcSocket &&
    hcCurrentConversationId
  ) {
    clearTimeout(hcTypingTimeout);
    hcTypingTimeout = setTimeout(function () {
      hcSocket.emit("typing", { conversation_id: hcCurrentConversationId });
    }, 200);
  }
});

function openNewMessageModal() {
  document.getElementById("new-msg-user-search").value = "";
  document.getElementById("new-msg-users-list").innerHTML = "";
  document.getElementById("new-message-modal").classList.add("open");
  document.body.style.overflow = "hidden";
  searchUsersForChat("");
}

function closeNewMessageModal() {
  document.getElementById("new-message-modal").classList.remove("open");
  document.body.style.overflow = "";
}

async function searchUsersForChat(query) {
  const res = await huFetch("/api/users?q=" + encodeURIComponent(query));
  const list = document.getElementById("new-msg-users-list");
  if (!res || !res.ok) {
    list.innerHTML =
      '<p style="padding:16px;color:var(--muted);font-size:13px;">Could not load users</p>';
    return;
  }
  const users = await res.json();
  if (users.length === 0) {
    list.innerHTML =
      '<p style="padding:16px;color:var(--muted);font-size:13px;">No users found</p>';
    return;
  }
  list.innerHTML = users
    .map(function (u) {
      const avatar = getLetterAvatar(u.name, 80);
      return (
        '<div class="new-msg-user-row" onclick="startNewConversation(\'' +
        u.id +
        "')\">" +
        '<img src="' +
        avatar +
        '" alt="' +
        u.name +
        '"/>' +
        "<div><strong>" +
        u.name +
        "</strong><span>" +
        (u.specialty || "Member") +
        "</span></div>" +
        "</div>"
      );
    })
    .join("");
}

async function startNewConversation(otherUserId) {
  const res = await huFetch("/api/messages/conversations/start", {
    method: "POST",
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
  if (!res || !res.ok) {
    showToast("Could not start conversation");
    return;
  }
  const data = await res.json();
  closeNewMessageModal();
  await renderConversationsList();
  openConversation(data.conversation_id);
}

function toggleChatMenu() {
  const menu = document.getElementById("chat-header-menu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

async function toggleBlockCurrentUser() {
  if (!hcCurrentOtherUser) return;
  const res = await huFetch("/api/users/" + hcCurrentOtherUser.id + "/block", {
    method: "POST",
  });
  if (!res || !res.ok) return;
  const data = await res.json();
  hcCurrentOtherUser.blocked_by_me = data.blocked;
  document.getElementById("chat-block-btn").textContent = data.blocked
    ? "Unblock user"
    : "Block user";
  document.getElementById("chat-blocked-banner").style.display = data.blocked
    ? "block"
    : "none";
  document.getElementById("chat-header-menu").style.display = "none";
  showToast(data.blocked ? "User blocked" : "User unblocked");
  renderConversationsList();
}

function toggleChatSearch() {
  const bar = document.getElementById("chat-search-bar");
  const isOpen = bar.style.display !== "none";
  bar.style.display = isOpen ? "none" : "flex";
  if (!isOpen) document.getElementById("chat-search-input").focus();
  else document.getElementById("chat-search-input").value = "";
  clearSearchHighlights();
}

function clearSearchHighlights() {
  document.querySelectorAll(".chat-msg").forEach(function (el) {
    el.classList.remove("search-match", "search-dim");
  });
}

async function performChatSearch(query) {
  if (!query.trim()) {
    clearSearchHighlights();
    return;
  }
  if (!hcCurrentConversationId) return;

  const res = await huFetch(
    "/api/messages/conversations/" +
      hcCurrentConversationId +
      "/search?q=" +
      encodeURIComponent(query),
  );
  if (!res || !res.ok) return;
  const matches = await res.json();
  const matchIds = new Set(
    matches.map(function (m) {
      return m.id;
    }),
  );

  document.querySelectorAll(".chat-msg").forEach(function (el) {
    const id = el.getAttribute("data-msg-id");
    if (matchIds.has(id)) {
      el.classList.add("search-match");
      el.classList.remove("search-dim");
    } else {
      el.classList.add("search-dim");
      el.classList.remove("search-match");
    }
  });

  const first = document.querySelector(".chat-msg.search-match");
  if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
}

function handleChatMediaSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  hcPendingMediaFile = file;
  const url = URL.createObjectURL(file);
  const preview = document.getElementById("chat-media-preview");
  const isVideo = file.type.startsWith("video");

  preview.style.display = "flex";
  preview.innerHTML =
    '<div class="chat-media-preview-item">' +
    (isVideo
      ? '<video src="' + url + '" muted></video>'
      : '<img src="' + url + '"/>') +
    '<button class="chat-media-remove-btn" onclick="clearChatMediaPreview()">\u2715</button></div>';
}

function clearChatMediaPreview() {
  hcPendingMediaFile = null;
  document.getElementById("chat-media-input").value = "";
  const preview = document.getElementById("chat-media-preview");
  preview.style.display = "none";
  preview.innerHTML = "";
}

async function uploadAndSendMediaMessage() {
  if (!hcPendingMediaFile || !hcCurrentConversationId) return;

  const fd = new FormData();
  fd.append("media", hcPendingMediaFile);

  const btn = document.querySelector(".chat-send-btn");
  if (btn) btn.disabled = true;

  try {
    const res = await huFetch("/api/messages/upload-media", {
      method: "POST",
      body: fd,
    });
    if (!res || !res.ok) {
      showToast("Could not upload media");
      return;
    }
    const data = await res.json();
    const input = document.getElementById("chat-input");
    const caption = input.value.trim();

    hcSocket.emit("send_message", {
      conversation_id: hcCurrentConversationId,
      content: caption,
      media_url: data.media_url,
      media_type: data.media_type,
      reply_to_id: hcReplyingToMessage ? hcReplyingToMessage.id : null,
    });

    input.value = "";
    clearChatMediaPreview();
    clearReplyPreview();
  } catch (e) {
    showToast("Error uploading media");
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function toggleVoiceRecording() {
  if (hcIsRecordingVoice) {
    stopVoiceRecording();
    return;
  }
  try {
    hcVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    showToast("Could not access microphone");
    return;
  }

  hcVoiceChunks = [];
  let mimeType = "audio/webm";
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "";

  hcVoiceRecorder = mimeType
    ? new MediaRecorder(hcVoiceStream, { mimeType: mimeType })
    : new MediaRecorder(hcVoiceStream);
  hcVoiceRecorder.ondataavailable = function (e) {
    if (e.data && e.data.size > 0) hcVoiceChunks.push(e.data);
  };
  hcVoiceRecorder.onstop = async function () {
    hcVoiceStream.getTracks().forEach(function (t) {
      t.stop();
    });
    const blob = new Blob(hcVoiceChunks, { type: "audio/webm" });
    await sendVoiceMessage(blob);
  };

  hcVoiceRecorder.start();
  hcIsRecordingVoice = true;
  document.getElementById("chat-mic-btn").classList.add("recording");
  document.getElementById("chat-mic-btn").textContent = "\u23F9\uFE0F";
}

function stopVoiceRecording() {
  if (hcVoiceRecorder && hcVoiceRecorder.state === "recording") {
    hcVoiceRecorder.stop();
  }
  hcIsRecordingVoice = false;
  document.getElementById("chat-mic-btn").classList.remove("recording");
  document.getElementById("chat-mic-btn").textContent = "\u{1F3A4}";
}

async function sendVoiceMessage(blob) {
  if (!hcCurrentConversationId) return;
  const file = new File([blob], "voice_" + Date.now() + ".webm", {
    type: "audio/webm",
  });
  const fd = new FormData();
  fd.append("media", file);

  try {
    const res = await huFetch("/api/messages/upload-media", {
      method: "POST",
      body: fd,
    });
    if (!res || !res.ok) {
      showToast("Could not send voice message");
      return;
    }
    const data = await res.json();
    hcSocket.emit("send_message", {
      conversation_id: hcCurrentConversationId,
      content: "",
      media_url: data.media_url,
      media_type: "audio",
      reply_to_id: hcReplyingToMessage ? hcReplyingToMessage.id : null,
    });
    clearReplyPreview();
  } catch (e) {
    showToast("Error sending voice message");
  }
}

function insertEmoji(emoji) {
  const input = document.getElementById("chat-input");
  input.value += emoji;
  input.focus();
}

document.addEventListener("DOMContentLoaded", function () {
  hcConnectSocket();
  renderConversationsList();
});

const hcOriginalNavigate = navigate;
navigate = function (pageId, clickedBtn) {
  hcOriginalNavigate(pageId, clickedBtn);
  if (pageId === "messages") renderConversationsList();
};

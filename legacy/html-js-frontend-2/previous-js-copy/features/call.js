// ============================================
// HEALTHY UNIVERSE - CALLING (call.js)
// WebRTC voice/video calls signaled via existing Socket.IO connection
// ============================================

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let callPeerConnection = null;
let callLocalStream = null;
let callRemoteUserId = null;
let callType = null; // "audio" | "video"
let callDurationInterval = null;
let callSeconds = 0;
let callIsMuted = false;
let callIsCameraOff = false;

// ── Start an outgoing call ────────────────────────────────────────────────────
async function startCall(type) {
  if (!hcCurrentOtherUser) {
    showToast("⚠️ Open a conversation first");
    return;
  }
  callType = type;
  callRemoteUserId = hcCurrentOtherUser.id;

  try {
    callLocalStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
  } catch (e) {
    showToast("❌ Could not access camera/mic");
    return;
  }

  callPeerConnection = new RTCPeerConnection(ICE_SERVERS);
  callLocalStream.getTracks().forEach(function (track) {
    callPeerConnection.addTrack(track, callLocalStream);
  });

  callPeerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      hcSocket.emit("call_ice_candidate", {
        to_user_id: callRemoteUserId,
        candidate: event.candidate,
      });
    }
  };

  callPeerConnection.ontrack = function (event) {
    attachRemoteStream(event.streams[0]);
  };

  const offer = await callPeerConnection.createOffer();
  await callPeerConnection.setLocalDescription(offer);

  hcSocket.emit("call_offer", {
    to_user_id: callRemoteUserId,
    call_type: type,
    offer: offer,
  });

  document.getElementById("outgoing-call-avatar").src = getLetterAvatar(
    hcCurrentOtherUser.name,
    160,
  );
  document.getElementById("outgoing-call-name").textContent =
    hcCurrentOtherUser.name;
  document.getElementById("outgoing-call-status").textContent =
    type === "video" ? "Video calling…" : "Calling…";
  document.getElementById("outgoing-call-screen").classList.add("open");
}

function cancelOutgoingCall() {
  if (callRemoteUserId) {
    hcSocket.emit("call_end", { to_user_id: callRemoteUserId });
  }
  cleanupCall();
  document.getElementById("outgoing-call-screen").classList.remove("open");
}

// ── Incoming call ─────────────────────────────────────────────────────────────
let incomingCallData = null;

function handleIncomingCallOffer(data) {
  incomingCallData = data;
  document.getElementById("incoming-call-avatar").src = getLetterAvatar(
    data.from_name,
    160,
  );
  document.getElementById("incoming-call-name").textContent = data.from_name;
  document.getElementById("incoming-call-type").textContent =
    data.call_type === "video"
      ? "Incoming video call…"
      : "Incoming voice call…";
  document.getElementById("incoming-call-screen").classList.add("open");
}

async function acceptIncomingCall() {
  if (!incomingCallData) return;
  const data = incomingCallData;
  callType = data.call_type;
  callRemoteUserId = data.from_user_id;

  try {
    callLocalStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });
  } catch (e) {
    showToast("❌ Could not access camera/mic");
    declineIncomingCall();
    return;
  }

  callPeerConnection = new RTCPeerConnection(ICE_SERVERS);
  callLocalStream.getTracks().forEach(function (track) {
    callPeerConnection.addTrack(track, callLocalStream);
  });

  callPeerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      hcSocket.emit("call_ice_candidate", {
        to_user_id: callRemoteUserId,
        candidate: event.candidate,
      });
    }
  };

  callPeerConnection.ontrack = function (event) {
    attachRemoteStream(event.streams[0]);
  };

  await callPeerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer),
  );
  const answer = await callPeerConnection.createAnswer();
  await callPeerConnection.setLocalDescription(answer);

  hcSocket.emit("call_answer", {
    to_user_id: callRemoteUserId,
    answer: answer,
  });

  document.getElementById("incoming-call-screen").classList.remove("open");
  showActiveCallUI(data.from_name);
  incomingCallData = null;
}

function declineIncomingCall() {
  if (incomingCallData) {
    hcSocket.emit("call_reject", { to_user_id: incomingCallData.from_user_id });
  }
  document.getElementById("incoming-call-screen").classList.remove("open");
  incomingCallData = null;
}

// ── Active call UI ────────────────────────────────────────────────────────────
function showActiveCallUI(remoteName) {
  const screen = document.getElementById("active-call-screen");
  screen.classList.add("open");

  document.getElementById("active-call-name").textContent =
    remoteName || (hcCurrentOtherUser ? hcCurrentOtherUser.name : "");
  document.getElementById("active-call-avatar-img").src = getLetterAvatar(
    remoteName || "U",
    160,
  );

  const localVideo = document.getElementById("local-call-video");
  localVideo.srcObject = callLocalStream;

  if (callType === "audio") {
    document.getElementById("remote-call-video").style.display = "none";
    document.getElementById("active-call-audio-avatar").style.display = "flex";
    document.getElementById("local-call-video").style.display = "none";
    document.getElementById("camera-toggle-btn").style.display = "none";
  } else {
    document.getElementById("remote-call-video").style.display = "block";
    document.getElementById("active-call-audio-avatar").style.display = "none";
    document.getElementById("local-call-video").style.display = "block";
    document.getElementById("camera-toggle-btn").style.display = "flex";
  }

  startCallTimer();
}

function attachRemoteStream(stream) {
  document.getElementById("outgoing-call-screen").classList.remove("open");
  if (
    !document.getElementById("active-call-screen").classList.contains("open")
  ) {
    showActiveCallUI(hcCurrentOtherUser ? hcCurrentOtherUser.name : "");
  }
  if (callType === "video") {
    document.getElementById("remote-call-video").srcObject = stream;
  } else {
    const audioEl = new Audio();
    audioEl.srcObject = stream;
    audioEl.autoplay = true;
    window.__callRemoteAudioEl = audioEl;
  }
}

function startCallTimer() {
  callSeconds = 0;
  updateCallDuration();
  callDurationInterval = setInterval(function () {
    callSeconds += 1;
    updateCallDuration();
  }, 1000);
}

function updateCallDuration() {
  const mm = String(Math.floor(callSeconds / 60)).padStart(2, "0");
  const ss = String(callSeconds % 60).padStart(2, "0");
  document.getElementById("call-duration").textContent = mm + ":" + ss;
}

// ── Call controls ─────────────────────────────────────────────────────────────
function toggleMute() {
  if (!callLocalStream) return;
  callIsMuted = !callIsMuted;
  callLocalStream.getAudioTracks().forEach(function (t) {
    t.enabled = !callIsMuted;
  });
  document.getElementById("mute-btn").classList.toggle("active", callIsMuted);
}

function toggleCamera() {
  if (!callLocalStream) return;
  callIsCameraOff = !callIsCameraOff;
  callLocalStream.getVideoTracks().forEach(function (t) {
    t.enabled = !callIsCameraOff;
  });
  document
    .getElementById("camera-toggle-btn")
    .classList.toggle("active", callIsCameraOff);
}

function endActiveCall() {
  if (callRemoteUserId) {
    hcSocket.emit("call_end", { to_user_id: callRemoteUserId });
  }
  cleanupCall();
}

function cleanupCall() {
  if (callPeerConnection) {
    callPeerConnection.close();
    callPeerConnection = null;
  }
  if (callLocalStream) {
    callLocalStream.getTracks().forEach(function (t) {
      t.stop();
    });
    callLocalStream = null;
  }
  if (callDurationInterval) {
    clearInterval(callDurationInterval);
    callDurationInterval = null;
  }
  if (window.__callRemoteAudioEl) {
    window.__callRemoteAudioEl.pause();
    window.__callRemoteAudioEl = null;
  }
  callRemoteUserId = null;
  callType = null;
  callIsMuted = false;
  callIsCameraOff = false;

  document.getElementById("outgoing-call-screen").classList.remove("open");
  document.getElementById("incoming-call-screen").classList.remove("open");
  document.getElementById("active-call-screen").classList.remove("open");
  document.getElementById("remote-call-video").srcObject = null;
  document.getElementById("local-call-video").srcObject = null;
}

// ── Hook socket listeners (call.js loads after chat.js, hcSocket already exists) ──
function hcRegisterCallListeners() {
  if (!hcSocket) {
    setTimeout(hcRegisterCallListeners, 300);
    return;
  }

  hcSocket.on("call_offer", function (data) {
    handleIncomingCallOffer(data);
  });

  hcSocket.on("call_answer", async function (data) {
    if (callPeerConnection) {
      await callPeerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
    }
  });

  hcSocket.on("call_ice_candidate", async function (data) {
    if (callPeerConnection && data.candidate) {
      try {
        await callPeerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate),
        );
      } catch (e) {}
    }
  });

  hcSocket.on("call_reject", function () {
    showToast("📞 Call declined");
    cleanupCall();
  });

  hcSocket.on("call_end", function () {
    showToast("📞 Call ended");
    cleanupCall();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  hcRegisterCallListeners();
});

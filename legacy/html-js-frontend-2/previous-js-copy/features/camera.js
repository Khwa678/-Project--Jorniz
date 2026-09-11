// ============================================
// HEALTHY UNIVERSE - CAMERA STUDIO (camera.js)
// Live camera + Instagram-style filters + photo/reel capture
// ============================================

const CAMERA_FILTERS = [
  { id: "normal", label: "Normal", css: "none" },
  {
    id: "clarendon",
    label: "Clarendon",
    css: "brightness(1.1) contrast(1.15) saturate(1.5)",
  },
  {
    id: "gingham",
    label: "Gingham",
    css: "brightness(1.05) hue-rotate(-8deg) saturate(0.85) sepia(0.12)",
  },
  { id: "juno", label: "Juno", css: "contrast(1.2) saturate(1.5) sepia(0.15)" },
  {
    id: "lark",
    label: "Lark",
    css: "contrast(0.9) saturate(1.15) brightness(1.15)",
  },
  {
    id: "ludwig",
    label: "Ludwig",
    css: "contrast(1.05) saturate(1.2) brightness(1.05) sepia(0.1)",
  },
  {
    id: "moon",
    label: "Moon",
    css: "grayscale(1) contrast(1.15) brightness(1.1)",
  },
  {
    id: "perpetua",
    label: "Perpetua",
    css: "brightness(1.1) contrast(0.9) saturate(1.1) sepia(0.15)",
  },
  {
    id: "reyes",
    label: "Reyes",
    css: "sepia(0.4) contrast(0.85) brightness(1.1) saturate(0.75)",
  },
];

let camStream = null;
let camFacingMode = "user";
let camMode = "photo"; // "photo" | "video"
let camSelectedFilter = CAMERA_FILTERS[0];
let camMediaRecorder = null;
let camRecordedChunks = [];
let camRecordTimerInterval = null;
let camRecordSeconds = 0;
const CAM_MAX_SECONDS = 30;
let camDrawLoopId = null;
let camCapturedBlob = null;
let camCapturedType = null; // "image" | "video"

// ── Open / Close ─────────────────────────────────────────────────────────────
async function openCameraModal() {
  document.getElementById("camera-modal").classList.add("open");
  document.body.style.overflow = "hidden";
  renderFilterStrip();
  setCameraMode("photo");
  await startCamera(camFacingMode);
}

function closeCameraModal() {
  stopCameraStream();
  clearCamRecordTimer();
  document.getElementById("camera-modal").classList.remove("open");
  document.body.style.overflow = "";
  resetCameraReviewUI();
}

function stopCameraStream() {
  if (camStream) {
    camStream.getTracks().forEach(function (t) {
      t.stop();
    });
    camStream = null;
  }
  if (camDrawLoopId) {
    cancelAnimationFrame(camDrawLoopId);
    camDrawLoopId = null;
  }
}

// ── Start camera ─────────────────────────────────────────────────────────────
async function startCamera(facingMode) {
  stopCameraStream();
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode },
      audio: true,
    });
  } catch (e) {
    showToast("❌ Could not access camera/mic. Check browser permissions.");
    return;
  }
  const video = document.getElementById("camera-video");
  video.srcObject = camStream;
  video.style.filter = camSelectedFilter.css;
}

function switchCamera() {
  camFacingMode = camFacingMode === "user" ? "environment" : "user";
  startCamera(camFacingMode);
}

// ── Filters ────────────────────────────────────────────────────────────────
function renderFilterStrip() {
  const strip = document.getElementById("camera-filters-strip");
  strip.innerHTML = CAMERA_FILTERS.map(function (f) {
    const active = f.id === camSelectedFilter.id ? "active" : "";
    return `
      <div class="camera-filter-item ${active}" onclick="selectCameraFilter('${f.id}')">
        <div class="camera-filter-thumb" style="filter:${f.css}"></div>
        <span>${f.label}</span>
      </div>
    `;
  }).join("");
}

function selectCameraFilter(filterId) {
  camSelectedFilter =
    CAMERA_FILTERS.find(function (f) {
      return f.id === filterId;
    }) || CAMERA_FILTERS[0];
  const video = document.getElementById("camera-video");
  video.style.filter = camSelectedFilter.css;
  renderFilterStrip();
}

// ── Mode toggle ──────────────────────────────────────────────────────────────
function setCameraMode(mode) {
  camMode = mode;
  document
    .getElementById("mode-photo-btn")
    .classList.toggle("active", mode === "photo");
  document
    .getElementById("mode-video-btn")
    .classList.toggle("active", mode === "video");
  document
    .getElementById("camera-capture-btn")
    .classList.toggle("video-mode", mode === "video");
}

// ── Capture button logic ──────────────────────────────────────────────────────
function handleCaptureButton() {
  if (camMode === "photo") {
    takePhoto();
  } else {
    if (camMediaRecorder && camMediaRecorder.state === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  }
}

// ── Take photo (with filter baked in) ────────────────────────────────────────
function takePhoto() {
  const video = document.getElementById("camera-video");
  const canvas = document.getElementById("camera-canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.filter = camSelectedFilter.css;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    function (blob) {
      camCapturedBlob = blob;
      camCapturedType = "image";
      const url = URL.createObjectURL(blob);
      const img = document.getElementById("camera-photo-preview");
      img.src = url;
      showCameraReview("image");
    },
    "image/jpeg",
    0.92,
  );
}

// ── Record video (filter applied live via canvas draw loop) ─────────────────
function startRecording() {
  const video = document.getElementById("camera-video");
  const canvas = document.getElementById("camera-canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");

  function drawFrame() {
    ctx.filter = camSelectedFilter.css;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    camDrawLoopId = requestAnimationFrame(drawFrame);
  }
  drawFrame();

  const canvasStream = canvas.captureStream(30);
  const audioTracks = camStream ? camStream.getAudioTracks() : [];
  audioTracks.forEach(function (t) {
    canvasStream.addTrack(t);
  });

  camRecordedChunks = [];
  let mimeType = "video/webm;codecs=vp9,opus";
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";

  camMediaRecorder = new MediaRecorder(canvasStream, { mimeType: mimeType });
  camMediaRecorder.ondataavailable = function (e) {
    if (e.data && e.data.size > 0) camRecordedChunks.push(e.data);
  };
  camMediaRecorder.onstop = function () {
    if (camDrawLoopId) {
      cancelAnimationFrame(camDrawLoopId);
      camDrawLoopId = null;
    }
    const blob = new Blob(camRecordedChunks, { type: "video/webm" });
    camCapturedBlob = blob;
    camCapturedType = "video";
    const url = URL.createObjectURL(blob);
    const vidPreview = document.getElementById("camera-video-preview");
    vidPreview.src = url;
    showCameraReview("video");
  };

  camMediaRecorder.start();
  document.getElementById("camera-capture-btn").classList.add("recording");
  startCamRecordTimer();
}

function stopRecording() {
  if (camMediaRecorder && camMediaRecorder.state === "recording") {
    camMediaRecorder.stop();
  }
  document.getElementById("camera-capture-btn").classList.remove("recording");
  clearCamRecordTimer();
}

function startCamRecordTimer() {
  camRecordSeconds = 0;
  const timerEl = document.getElementById("camera-rec-timer");
  const timeEl = document.getElementById("camera-rec-time");
  timerEl.style.display = "flex";
  updateTimerDisplay(timeEl);

  camRecordTimerInterval = setInterval(function () {
    camRecordSeconds += 1;
    updateTimerDisplay(timeEl);
    if (camRecordSeconds >= CAM_MAX_SECONDS) {
      stopRecording();
    }
  }, 1000);
}

function updateTimerDisplay(timeEl) {
  const mm = String(Math.floor(camRecordSeconds / 60)).padStart(2, "0");
  const ss = String(camRecordSeconds % 60).padStart(2, "0");
  timeEl.textContent = mm + ":" + ss;
}

function clearCamRecordTimer() {
  if (camRecordTimerInterval) {
    clearInterval(camRecordTimerInterval);
    camRecordTimerInterval = null;
  }
  const timerEl = document.getElementById("camera-rec-timer");
  if (timerEl) timerEl.style.display = "none";
}

// ── Review screen (after capture) ────────────────────────────────────────────
function showCameraReview(type) {
  document.getElementById("camera-video").style.display = "none";
  document.getElementById("camera-switch-btn").style.display = "none";
  document.getElementById("camera-filters-strip").style.display = "none";
  document.querySelector(".camera-mode-toggle").style.display = "none";
  document.getElementById("camera-controls-live").style.display = "none";
  document.getElementById("camera-controls-review").style.display = "flex";

  if (type === "image") {
    document.getElementById("camera-photo-preview").style.display = "block";
  } else {
    document.getElementById("camera-video-preview").style.display = "block";
  }
}

function resetCameraReviewUI() {
  document.getElementById("camera-video").style.display = "block";
  document.getElementById("camera-switch-btn").style.display = "flex";
  document.getElementById("camera-filters-strip").style.display = "flex";
  document.querySelector(".camera-mode-toggle").style.display = "flex";
  document.getElementById("camera-controls-live").style.display = "flex";
  document.getElementById("camera-controls-review").style.display = "none";
  document.getElementById("camera-photo-preview").style.display = "none";
  document.getElementById("camera-video-preview").style.display = "none";
  camCapturedBlob = null;
  camCapturedType = null;
}

function retakeCapture() {
  resetCameraReviewUI();
  startCamera(camFacingMode);
}

// ── Use captured media → inject into existing post upload flow ─────────────
function useCapturedMedia() {
  if (!camCapturedBlob) return;

  const ext = camCapturedType === "image" ? "jpg" : "webm";
  const mimeType = camCapturedType === "image" ? "image/jpeg" : "video/webm";
  const fileName = "capture_" + Date.now() + "." + ext;
  const file = new File([camCapturedBlob], fileName, { type: mimeType });

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  const mediaInput = document.getElementById("media-input");
  mediaInput.files = dataTransfer.files;

  const previewContainer = document.getElementById("preview-container");
  const url = URL.createObjectURL(file);
  if (camCapturedType === "image") {
    previewContainer.innerHTML =
      '<img src="' + url + '" style="width:100%;border-radius:10px;">';
  } else {
    previewContainer.innerHTML =
      '<video src="' +
      url +
      '" controls style="width:100%;border-radius:10px;"></video>';
  }

  closeCameraModal();
  showToast("✅ Media captured! Ready to post.");
}

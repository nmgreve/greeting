import { ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const videoSection = document.getElementById("videoSection");
const countdownEl = document.getElementById("countdown");
const warningEl = document.getElementById("warning");
const preview = document.getElementById("preview");
const statusMsg = document.getElementById("statusMsg");
const clearBtn = document.getElementById("clearButton");

let mediaRecorder;
let chunks = [];
let timer;
let recording = false;

nameInput.oninput = () => {
  if (!recording) { // Only show the clear button if not recording
    clearBtn.classList.toggle("visible", nameInput.value.trim() !== "");
  }
};

clearBtn.onclick = () => {
  nameInput.value = "";
  clearBtn.classList.remove("visible");
};

startBtn.onclick = async () => {
  if (!recording) {
    // Start recording
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter your name.");

    clearBtn.classList.remove("visible"); // Hide clear button during recording

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    preview.srcObject = stream;

    chunks = [];
    videoSection.classList.remove("hidden");
    // Scroll to bottom when video section becomes visible
    startBtn.textContent = "Stop Recording";
    nameInput.disabled = true;
    statusMsg.textContent = "";
    recording = true;

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
  preview.pause();
  preview.srcObject.getTracks().forEach(track => track.stop());
  preview.srcObject = null;
  preview.style.display = "none";

  statusMsg.textContent = "Uploading...";
  const progressBar = document.getElementById("uploadProgress");
  const progressText = document.getElementById("progressPercent");

  progressBar.classList.remove("hidden");
  progressText.classList.remove("hidden");

  const blob = new Blob(chunks, { type: "video/webm" });
  const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.webm`;

  try {
    const fileRef = ref(window.firebaseStorage, "wedding-videos/" + fileName);
    const uploadTask = uploadBytesResumable(fileRef, blob);

    uploadTask.on("state_changed", 
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        progressBar.value = percent;
        progressText.textContent = percent + "%";
      }, 
      (error) => {
        console.error("Upload failed:", error);
        statusMsg.textContent = `❌ Upload failed: ${error.message || "Unknown error"}`;
        progressBar.classList.add("hidden");
        progressText.classList.add("hidden");
      }, 
      () => {
        statusMsg.textContent = "✅ Video uploaded! Thank you!";
        progressBar.classList.add("hidden");
        progressText.classList.add("hidden");
      }
    );
  } catch (err) {
    console.error("Upload error:", err);
    statusMsg.textContent = `❌ Upload failed: ${err.message || "Unknown error"}`;
  }

  reset();
};

    mediaRecorder.start();
    startCountdown(60);

  } else {
    // Stop recording
    clearInterval(timer);
    mediaRecorder.stop();
  }
};

function startCountdown(seconds) {
  let time = seconds;
  countdownEl.textContent = time;

  timer = setInterval(() => {
    time--;
    countdownEl.textContent = time;

    if (time <= 10) {
      warningEl.classList.remove("hidden");
    }
    if (time <= 30) {
      countdownEl.classList.add("green");
    }

    if (time <= 0) {
      clearInterval(timer);
      mediaRecorder.stop();
    }
  }, 1000);
}

function reset() {
  recording = false;
  startBtn.textContent = "Start Recording";
  videoSection.classList.add("hidden");
  warningEl.classList.add("hidden");
  countdownEl.classList.remove("green");
  nameInput.disabled = false;
  clearBtn.classList.toggle("visible", nameInput.value.trim() !== "");

  // Show the preview element again for next recording
  preview.style.display = "block";

  preview.srcObject = null;
}

import { ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

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
    startBtn.textContent = "Stop Recording";
    nameInput.disabled = true;
    statusMsg.textContent = "";
    recording = true;

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      // Hide and stop preview immediately
      preview.pause();
      preview.srcObject.getTracks().forEach(track => track.stop());
      preview.srcObject = null;
      preview.style.display = "none";

      // Show uploading message
      statusMsg.textContent = "Please wait, the video is uploading...";
      statusMsg.style.display = "block";

      const blob = new Blob(chunks, { type: "video/webm" });
      const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.webm`;

      try {
        const fileRef = ref(window.firebaseStorage, "wedding-videos/" + fileName);
        console.log("Firebase Storage Reference:", fileRef);
        console.log("Firebase Storage Object:", window.firebaseStorage);
        await uploadBytes(fileRef, blob);
        statusMsg.textContent = "✅ Video uploaded! Thank you!";
      } catch (err) {
        console.error("Upload failed:", err);
        statusMsg.textContent = `❌ Upload failed: ${err.message || "Unknown error"}. Please check the console for more details.`;
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

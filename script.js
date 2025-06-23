import { ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const videoSection = document.getElementById("videoSection");
const countdownEl = document.getElementById("countdown");
const warningEl = document.getElementById("warning");
const preview = document.getElementById("preview");
const statusMsg = document.getElementById("statusMsg");

// NEW stop button
const stopBtn = document.createElement("button");
stopBtn.textContent = "Stop Recording";
stopBtn.classList.add("hidden");
document.querySelector(".container").appendChild(stopBtn);

let mediaRecorder;
let chunks = [];
let timer;

startBtn.onclick = async () => {
  const name = nameInput.value.trim();
  if (!name) return alert("Please enter your name.");

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  preview.srcObject = stream;

  chunks = [];
  videoSection.classList.remove("hidden");
  startBtn.disabled = true;
  nameInput.disabled = true;
  statusMsg.textContent = "";
  stopBtn.classList.remove("hidden");

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.webm`;

    try {
      const fileRef = ref(window.firebaseStorage, "wedding-videos/" + fileName);
      await uploadBytes(fileRef, blob);
      statusMsg.textContent = "✅ Video uploaded! Thank you!";
    } catch (err) {
      console.error(err);
      statusMsg.textContent = "❌ Upload failed. Please try again.";
    }

    reset();
  };

  mediaRecorder.start();
  startCountdown(60);
};

stopBtn.onclick = () => {
  clearInterval(timer);
  mediaRecorder.stop();
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
  stopBtn.classList.add("hidden");
  videoSection.classList.add("hidden");
  warningEl.classList.add("hidden");
  countdownEl.classList.remove("green");
  nameInput.disabled = false;
  startBtn.disabled = false;
  nameInput.value = "";

  const stream = preview.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  preview.srcObject = null;
}

import { ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const videoSection = document.getElementById("videoSection");
const countdownEl = document.getElementById("countdown");
const warningEl = document.getElementById("warning");
const preview = document.getElementById("preview");
const statusMsg = document.getElementById("statusMsg");
const clearBtn = document.getElementById("clearButton");
const progressBar = document.getElementById("uploadProgress");
const progressText = document.getElementById("progressPercent");
const guestbookTitle = document.getElementById("guestbookTitle");
const guestbookSubtitle = document.getElementById("guestbookSubtitle");
const inputContainer = document.querySelector(".input-container");
const recordingIndicator = document.getElementById("recordingIndicator");
const mediaPicker = document.getElementById("mediaPicker");
const mediaUploadBtn = document.getElementById("mediaUploadBtn");


let mediaRecorder;
let chunks = [];
let currentBlob = null;
let currentFileName = null;
let timer;
let recording = false;

nameInput.oninput = () => {
  if (!recording) {
    clearBtn.classList.toggle("visible", nameInput.value.trim() !== "");
  }
};

clearBtn.onclick = () => {
  nameInput.value = "";
  clearBtn.classList.remove("visible");
};

startBtn.onclick = async () => {
  if (!recording) {
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter your name.");

    clearBtn.classList.remove("visible");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    preview.srcObject = stream;
    preview.style.display = "block";

    chunks = [];
    videoSection.classList.remove("hidden");
    updateVisibility();

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
      hideRecordingIndicator();

      statusMsg.textContent = "Uploading...";
      videoSection.classList.add("hidden");
      updateVisibility();
      showProgressElements();

      const blob = new Blob(chunks, { type: "video/webm" });
      currentBlob = blob;
      const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.webm`;
      currentFileName = fileName;

      try {
        const fileRef = ref(window.firebaseStorage, "wedding-videos/" + fileName);
        const uploadTask = uploadBytesResumable(fileRef, blob);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            progressBar.value = percent;
            progressText.textContent = percent + "%";
          },
          (error) => {
            console.error("Upload failed:", error);
            statusMsg.textContent = "❌ Upload failed";
            hideProgressElements();
            reset();  // Reset on error
          },
          () => {
            console.log("✅ Upload complete");
            statusMsg.textContent = "✅ Video uploaded! Click 'Start Recording' to send another message";
            setTimeout(() => {
              hideProgressElements();
              reset();  // Reset on success after a short delay
            }, 1000);
          }
        );

      } catch (err) {
        console.error("Upload error:", err);
        statusMsg.textContent = `❌ Upload failed: ${err.message || "Unknown error"}`;
        hideProgressElements();
        reset();
      }
    };

    mediaRecorder.start();
    startCountdown(45);
    showRecordingIndicator();
  } else {
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

    if (time <= 10) warningEl.classList.remove("hidden");
    if (time <= 20) countdownEl.classList.add("green");

    if (time <= 0) {
      clearInterval(timer);
      mediaRecorder.stop();
    }
  }, 1000);
}

function showProgressElements() {
  console.log("Showing progress elements");
  progressBar.style.display = "inline-block";
  progressText.style.display = "inline";
  progressBar.classList.remove("hidden");
  progressText.classList.remove("hidden");
}

function hideProgressElements() {
  progressBar.style.display = "none";
  progressText.style.display = "none";
  progressBar.classList.add("hidden");
  progressText.classList.add("hidden");
  progressBar.value = 0;
  progressText.textContent = "0%";
}

function reset() {
  recording = false;
  startBtn.textContent = "Start Recording";
  videoSection.classList.add("hidden");
  warningEl.classList.add("hidden");
  countdownEl.classList.remove("green");
  nameInput.disabled = false;
  clearBtn.classList.toggle("visible", nameInput.value.trim() !== "");
  countdownEl.textContent = 45;

  hideProgressElements();
  updateVisibility();

  preview.style.display = "block";
  preview.srcObject = null;
}

progressText.addEventListener("click", () => {
  if (!currentBlob) return;
  const url = URL.createObjectURL(currentBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

function updateVisibility() {
  const videoVisible = !videoSection.classList.contains("hidden");

  if (videoVisible) {
    guestbookTitle.classList.add("hidden");
    guestbookSubtitle.classList.add("hidden");
    inputContainer.classList.add("hidden");
  } else {
    guestbookTitle.classList.remove("hidden");
    guestbookSubtitle.classList.remove("hidden");
    inputContainer.classList.remove("hidden");
  }
}

function showRecordingIndicator() {
  recordingIndicator.style.display = "block";
}

function hideRecordingIndicator() {
  recordingIndicator.style.display = "none";
}

//Handles Click of Media Upload Button
mediaUploadBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) return alert("Please enter your name."); // forces use of name
  mediaPicker.click();
});

mediaPicker.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files);
  const timeNow = Date.now();
  const safeName = nameInput.value.trim().replace(/\s+/g, "_");
  let fileList = ""; // Shared across all files
  const uploadPromises = [];

  showProgressElements();

  for (const file of files) {
    const newFileName = `${safeName}_${timeNow}_${file.name}`;
    const storageRef = ref(window.firebaseStorage, `library-uploads/${newFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const uploadPromise = new Promise((resolve) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          progressBar.value = percent;
          progressText.textContent = percent + "%";
        },
        (error) => {
          console.error(`Error uploading ${file.name}:`, error);
          fileList += `${file.name} - ❌ Error, Try this File Again\n`;
          statusMsg.textContent = fileList;
          resolve(); // Resolve to continue to next file
        },
        () => {
          fileList += `${file.name} - ✅ Complete\n`;
          statusMsg.textContent = fileList;
          console.log(`${file.name} Complete`);
          resolve(); // Resolve when upload is complete
        }
      );
    });

    uploadPromises.push(uploadPromise);
  }

  await Promise.all(uploadPromises);
  setTimeout(() => {
    hideProgressElements();
    reset();
  }, 1000);
});


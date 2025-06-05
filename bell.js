// bell.js — triggers audio playback using stored user preference
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("bellSound", (result) => {
    const selectedSound = result.bellSound || "simple.mp3"; // default fallback
    const audio = document.createElement("audio");
    audio.id = "angelus-audio";
    audio.src = chrome.runtime.getURL(`audio/${selectedSound}`);
    audio.autoplay = true;
    audio.style.display = "none";
    audio.addEventListener("canplaythrough", () => {
      audio.play().catch(err => console.error("Audio playback failed:", err));
    });
    document.body.appendChild(audio);
  });
});

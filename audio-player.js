document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const soundParam = urlParams.get("sound");
  const sound = (soundParam === "bell" || soundParam === "default") ? "bell" : "bell";
  const audioElement = document.getElementById("bellAudio");
  const fallbackButton = document.getElementById("fallbackButton");

  const audioUrl = chrome.runtime.getURL(`audio/${sound}.mp3`);
  audioElement.src = audioUrl;

  // Try to load the audio file
  audioElement.load();

  // Log if the file is accessible
  audioElement.addEventListener("canplaythrough", () => {
    console.log("Audio file loaded successfully:", audioUrl);
  });

  fallbackButton.addEventListener("click", async () => {
    try {
      await audioElement.play();
      console.log("Manual playback succeeded");
    } catch (err) {
      console.error("Manual playback also failed:", err);
      alert(
        "Playback failed. Please ensure the file exists and that autoplay restrictions are not preventing playback."
      );
    }
    fallbackButton.style.display = "none";
  });
});
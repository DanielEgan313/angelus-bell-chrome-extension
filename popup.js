document.addEventListener("DOMContentLoaded", () => {
  function setSoundIcon(isPlaying) {
    const playIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>`;
    const stopIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="12" height="12"/></svg>`;
    if (soundIcon) {
      soundIcon.innerHTML = isPlaying ? stopIcon : playIcon;
    }
  }

  // Wipe any legacy keys from storage to prevent conflict
  chrome.storage.local.remove(["6", "12", "18"], () => {
    console.log("Old hour keys purged from storage.");
  });
  const bellSoundSelect = document.getElementById("bellSound");
  const inlineAudio = document.getElementById("inlineBellAudio");
  const timePills = document.querySelectorAll(".time-pill");

  // Clear selected classes immediately to prevent flicker
  timePills.forEach((pill) => {
    pill.classList.remove("selected");
  });


  // Load all initial values
  chrome.storage.local.get(["enabledHours", "bellSound"], (result) => {
    let enabledHours;
    if (Object.prototype.hasOwnProperty.call(result, "enabledHours")) {
      enabledHours = result.enabledHours;
    } else {
      enabledHours = [6, 12, 18];
      chrome.storage.local.set({ enabledHours });
    }
    // Support "no-sound" as a valid option
    const savedSound = result.bellSound === "no-sound" ? "no-sound" : (result.bellSound || "lebarroux.mp3");

    // Load audio selection
    if (bellSoundSelect) {
      bellSoundSelect.value = savedSound;
    }
    if (inlineAudio) {
      if (savedSound === "no-sound") {
        inlineAudio.removeAttribute("src");
      } else {
        inlineAudio.src = chrome.runtime.getURL(`audio/${savedSound}`);
      }
    }

    // Highlight selected pills
    timePills.forEach((pill) => {
      pill.classList.remove("selected");
      const hour = parseInt(pill.dataset.time, 10);
      if (enabledHours.includes(hour)) {
        pill.classList.add("selected");
      }
    });

    const warning = document.createElement("div");
    warning.id = "noTimesWarning";
    warning.style.color = "#666";
    warning.style.fontSize = "12px";
    warning.style.margin = "8px 0 16px 0";
    warning.style.textAlign = "center";
    warning.textContent = "Choose one or more times to enable the Angelus Bell.";
    document.querySelector(".time-container")?.appendChild(warning);
    warning.style.display = enabledHours.length === 0 ? "block" : "none";
  });


  // Time pill toggle
  timePills.forEach((pill) => {
    const hour = parseInt(pill.dataset.time, 10);

    pill.addEventListener("click", () => {
      chrome.storage.local.get("enabledHours", (result) => {
        let hours = Array.isArray(result.enabledHours) ? result.enabledHours : [];
        const alreadySelected = pill.classList.contains("selected");

        if (alreadySelected) {
          hours = hours.filter(h => h !== hour);
          pill.classList.remove("selected");
        } else {
          hours.push(hour);
          pill.classList.add("selected");
        }

        chrome.storage.local.set({ enabledHours: hours }, () => {
          console.log("enabledHours updated:", hours);
          // Show "Saved!" confirmation popup
          const confirmation = document.createElement("div");
          confirmation.textContent = "Saved!";
          confirmation.style.position = "absolute";
          confirmation.style.top = "10px";
          confirmation.style.right = "10px";
          confirmation.style.backgroundColor = "#4CAF50";
          confirmation.style.color = "white";
          confirmation.style.padding = "5px 10px";
          confirmation.style.borderRadius = "5px";
          confirmation.style.fontSize = "12px";
          confirmation.style.zIndex = "9999";
          document.body.appendChild(confirmation);
          setTimeout(() => {
            confirmation.remove();
          }, 1500);

          // Show or hide warning if no times are selected
          let warning = document.getElementById("noTimesWarning");
          if (!warning) {
            warning = document.createElement("div");
            warning.id = "noTimesWarning";
            warning.style.color = "#666";
            warning.style.fontSize = "12px";
            warning.style.margin = "8px 0 16px 0";
            warning.style.textAlign = "center";
            warning.textContent = "Choose one or more times to enable the Angelus Bell.";
            document.querySelector(".time-container")?.appendChild(warning);
          }
          warning.style.display = hours.length === 0 ? "block" : "none";
        });
      });
    });
  });

  // Audio selection
  if (bellSoundSelect) {
    bellSoundSelect.addEventListener("change", () => {
      const selectedSound = bellSoundSelect.value;

      // Stop currently playing audio and reset icon
      if (inlineAudio) {
        inlineAudio.pause();
        inlineAudio.currentTime = 0;
      }
      isPlaying = false;
      setSoundIcon(false);

      chrome.storage.local.set({ bellSound: selectedSound }, () => {
        if (inlineAudio) {
          if (selectedSound === "no-sound") {
            inlineAudio.removeAttribute("src");
          } else {
            inlineAudio.src = chrome.runtime.getURL(`audio/${selectedSound}`);
          }
        }
        console.log("Bell sound updated:", selectedSound);
      });
    });
  }

  const soundToggleBtn = document.getElementById("soundToggle");
  const soundIcon = document.getElementById("soundToggleIcon");

  if (bellSoundSelect && soundToggleBtn) {
    const togglePlayButtonVisibility = () => {
      const isSilent = bellSoundSelect.value === "no-sound";
      soundToggleBtn.classList.toggle("hidden", isSilent);
    };

    console.log("Initial bell sound:", bellSoundSelect.value);
    console.log("Toggle button element found:", !!soundToggleBtn);
    console.log("Should be hidden:", bellSoundSelect.value === "no-sound");

    bellSoundSelect.addEventListener("change", togglePlayButtonVisibility);
    togglePlayButtonVisibility(); // run once on load
  }

  if (soundToggleBtn && inlineAudio) {
    let isPlaying = false;

    soundToggleBtn.addEventListener("click", () => {
      if (bellSoundSelect && bellSoundSelect.value === "no-sound") return;
      if (!isPlaying) {
        inlineAudio.play().then(() => {
          isPlaying = true;
          setSoundIcon(true);
        }).catch((error) => {
          console.warn("Audio play() interrupted:", error);
        });
      } else {
        inlineAudio.pause();
        inlineAudio.currentTime = 0;
        isPlaying = false;
        setSoundIcon(false);
      }

      inlineAudio.onended = () => {
        isPlaying = false;
        setSoundIcon(false);
      };
    });
  }

  setSoundIcon(false);

  // Dynamically set copyright year
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Display extension version
  const versionSpan = document.getElementById("versionDisplay");
  if (versionSpan) {
    versionSpan.textContent = `v${chrome.runtime.getManifest().version}`;
  }
});

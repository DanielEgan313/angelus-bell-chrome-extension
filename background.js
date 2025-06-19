// background.js – triggers bell.html in a new tab on alarm

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.clearAll(() => {
    console.log("Angelus Bell Extension installed.");
    scheduleAngelusAlarms();
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!chrome.tabs) {
    console.log("Skipping alarm — no tabs available (likely locked screen or logged-out user).");
    return;
  }
  chrome.storage.local.get("enabledHours", (result) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (alarm.name.startsWith("angelus-")) {
      const scheduledHour = parseInt(alarm.name.split("-")[1]);

      const hoursSelected = Array.isArray(result.enabledHours) ? result.enabledHours : [];

      if (
        !hoursSelected.includes(scheduledHour) ||
        !(currentHour === scheduledHour && currentMinute === 0)
      ) {
        console.log(`Skipping bell: ${alarm.name} — Either hour not enabled or not at exact time (${now.toLocaleTimeString()})`);
        return;
      }
    }

    if (alarm.name !== "test-bell" && !alarm.name.startsWith("angelus-")) {
      console.log("Unrecognized alarm — skipping.");
      return;
    }

    console.log("⏰ Time for the Angelus:", alarm.name);
    if (alarm.name.startsWith("angelus") || alarm.name === "test-bell") {
      chrome.tabs.create({
        url: chrome.runtime.getURL("bell.html"),
        active: true
      });
    }
  });
});

function scheduleAngelusAlarms() {
  chrome.storage.local.get("enabledHours", (result) => {
    let times = Array.isArray(result.enabledHours) ? result.enabledHours : [6, 12, 18];
    if (!result.enabledHours) {
      chrome.storage.local.set({ enabledHours: times });
    }
    for (const hour of times) {
      const name = `angelus-${hour}`;
      chrome.alarms.create(name, {
        when: getNextOccurrence(hour),
        periodInMinutes: 1440
      });
    }
  });
}

function getNextOccurrence(hour) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

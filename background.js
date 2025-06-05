// background.js – triggers bell.html in a new tab on alarm

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.clearAll(() => {
    console.log("Angelus Bell Extension installed.");
    scheduleAngelusAlarms();
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.local.get("enabledHours", (result) => {
    const hours = Array.isArray(result.enabledHours) ? result.enabledHours : [];
    if (alarm.name !== "test-bell" && hours.length === 0) {
      console.log("No bell times selected — skipping bell trigger.");
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
    const times = Array.isArray(result.enabledHours) ? result.enabledHours : [6, 12, 18];
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

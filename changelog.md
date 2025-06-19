

# Changelog

## v1.1 – Fix for Sleep/Wake Trigger Bug (June 19, 2025)

### 🛠 Bug Fixes
- Fixed an issue where bell sounds would incorrectly trigger after the computer wakes from sleep.
- Now skips bell events that were missed while the machine was asleep or inactive.

### ✅ Behavior Improvements
- Scheduled times no longer retroactively fire when the system resumes.
- Bell logic executes only during valid, awake sessions.

---

## v1.0 – Initial Public Release

- Rings the Angelus Bell at user-selected times.
- Supports audio playback in English and Latin.
- User can select from multiple bell sounds.
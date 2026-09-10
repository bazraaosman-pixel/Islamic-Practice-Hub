---
name: Adhan sound choices
description: Constraints for selectable Adhan previews and native prayer-notification sounds.
---

Each Adhan choice must map to the same bundled asset for preview and notifications. On Android, use a distinct stable notification channel ID for each sound because an existing channel's sound is effectively immutable.

**Why:** Reusing one Android channel can keep playing its original sound after the user changes the selection. Preview-only changes can otherwise appear correct while scheduled notifications remain wrong.

**How to apply:** Register every notification sound in the Expo plugin, rebuild the native app after asset changes, reschedule transactionally when the choice changes, and preserve the Expo Go guard. Keep source and provenance disclosures accurate.
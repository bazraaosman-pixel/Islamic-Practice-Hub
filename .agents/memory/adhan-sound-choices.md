---
name: Adhan sound choices
description: Constraints for selectable Adhan previews and native prayer-notification sounds.
---

Each bundled Adhan choice must map to the same asset for preview and notifications. User-uploaded audio is preview/in-app only; scheduled native notifications must use a clearly disclosed bundled fallback. On Android, use a distinct stable notification channel ID for each bundled sound because an existing channel's sound is effectively immutable.

**Why:** Reusing one Android channel can keep playing its original sound after the user changes the selection. Preview-only changes can otherwise appear correct while scheduled notifications remain wrong.

**How to apply:** Register every notification sound in the Expo plugin, rebuild the native app after asset changes, never pass a runtime file URI to notification APIs, reschedule transactionally when the choice changes, and preserve the Expo Go guard. Keep source, provenance, and fallback disclosures accurate.
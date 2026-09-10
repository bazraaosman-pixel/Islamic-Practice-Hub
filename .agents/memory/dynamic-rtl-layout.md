---
name: Dynamic RTL layout
description: Direction strategy for live Arabic and English switching in the Expo app.
---

Use explicit language-aware row direction, text alignment, writing direction, and directional icons. Do not combine inherited container `direction: rtl` with Arabic `row-reverse`.

**Why:** On React Native Web, inherited RTL direction and explicit row reversal can cancel each other, leaving Arabic content visually LTR even though both styles appear RTL-aware.

**How to apply:** For ordinary UI rows, use Arabic `row-reverse` and English `row`, align Arabic copy right and English copy left, and mirror chevrons/arrows. Keep Quran verses and Arabic dua source RTL regardless of the surrounding UI language.
---
name: Quran text integrity
description: Rules for preserving and correctly displaying the bundled offline Quran corpus.
---

Keep the bundled Tanzil-derived Arabic text unchanged. Display a separate basmala only for surahs other than Al-Fatihah and At-Tawbah, and use a Quran-capable Arabic font for verses and Quranic marks.

**Why:** Generic UI fonts omit Uthmani glyphs and produce replacement boxes. A separate basmala duplicates Al-Fatihah verse 1 and is incorrect before At-Tawbah.

**How to apply:** Any Quran dataset, reader, typography, or verse-formatting change must preserve the source text byte-for-byte, retain attribution, verify the 114-surah/6,236-verse count, and visually check Al-Fatihah, Al-Baqarah, and At-Tawbah.
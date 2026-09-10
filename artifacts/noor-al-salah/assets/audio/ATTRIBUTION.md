# Audio attribution

## Bundled Adhan choices

- `makkah-adhan.wav` source recording: `Ahmed_al_Imadi_Adhan.mp3`
- `madinah-adhan.wav` source recording: `Majed_al_Hamathani_Adhan.mp3`
- Collection: `Adhan Notifications`
- Source: https://archive.org/details/adhan.notifications
- License: Public Domain Mark 1.0
- Modification: each source was converted to mono PCM WAV and limited to the first 29 seconds for native notification-sound compatibility.

The Makkah and Madinah names are the app's selectable sound labels; the archive metadata identifies
the recordings by reciter, not geographic origin. They must not be presented as authenticated
live recordings from either city: these are Makkah-style and Madinah-style options only.
The archive items `MakkahAzan` and `AsrAzanFromMakkah` were not used because their metadata does
not provide an explicit redistribution license. `traditional-adhan.wav` is retained as a legacy
asset only and is not used by the notification pipeline.
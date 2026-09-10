---
name: Expo Go notifications
description: Compatibility rule for preventing notification native-module crashes in Expo Go.
---

Do not statically import or initialize `expo-notifications` when `Constants.executionEnvironment` is `StoreClient`. Load it lazily only in supported native builds, and keep notifications disabled in Expo Go and web.

**Why:** Import-time native-module initialization can crash the entire app in Expo Go before a platform check inside a notification function can run.

**How to apply:** Route all notification access through the guarded lazy loader. Settings and persisted preferences must reflect that notifications are unavailable rather than attempting initialization.
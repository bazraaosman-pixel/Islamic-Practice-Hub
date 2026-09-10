---
name: Prayer alert delivery
description: Reliability constraints for rolling local prayer notifications.
---

Maintain a rolling notification horizon with both app-foreground replenishment and a registered background task. Expo BackgroundTask `minimumInterval` is measured in minutes, and background execution must only inspect existing permissions.

**Why:** A fixed seven-day batch eventually expires, and treating the background interval as seconds can delay replenishment for weeks. Permission prompts are not valid during background execution.

**How to apply:** Serialize cancellation and rescheduling, validate persisted per-prayer settings, register exact-alarm permission on Android, use stable sound-specific channels, and clean up every newly scheduled ID if scheduling or ID persistence fails.
# Step Counter: All-Day Steps and Walk Routes on Android

## Overview

An Android app that counts my steps all day, even when the app is closed or the phone restarts, and records walks I start and stop: the GPS route on a street map, with distance, time, pace and steps. It is built for one phone (a moto g 5G) and installed from an APK, with no store and no account.

| | |
|---|---|
| Stack | Kotlin, Jetpack Compose, Material 3, Room |
| Map | MapLibre with OpenFreeMap tiles (no API key) |
| Location | Fused location provider, only between Start and Stop |
| Size | About 3,200 lines of Kotlin |
| Tests | 75 JVM tests, 4 on-device Room tests |
| Release | 2.0, about 16 MB (arm64) |

Screens: **Today** (an animated goal ring, streak, distance, energy and walks), **Walks** (each walk with its route), **History** (7 and 30 days, goal days in green) and **Settings** (goal, stride, weight). Distance is steps times stride, and energy uses the ACSM net cost of walking (0.5 kcal per kg per km).

---

## Counting with the app closed

The phone has a hardware step counter, but it only counts while some app keeps it registered, and a check of the phone's sensor services showed nothing else does. So the app runs a foreground service that registers the counter and holds no wake lock. I ruled out WorkManager: it samples every 15 minutes at best, and the counter would not count in between.

The counter is cumulative since boot, so the app stores a baseline and the phone's boot count with every sample. `StepAccumulator` handles the first sample, a reboot, two reboots in a row and a counter that goes backwards, each with its own test. Writes are throttled to one every 5 seconds, which loses nothing because the counter is cumulative.

Measured on the phone:

- In a walk with the app closed, it counted 92 of 100 steps I counted by hand (the target was 90 to 110), and the service held no wake lock.
- Steps survive a reboot. About the first 70 seconds after boot are not counted, because Android queues the boot broadcast to apps.

---

## Recording a walk

Location is requested every 2 seconds at high accuracy, and only between Start and Stop; the app has no background-location permission. Fixes worse than 25 m accuracy are dropped, and so are fixes under 2 m from the last one kept. Points are written in batches about every 10 seconds, and Stop needs a one-second press and hold.

If Android kills the app mid-walk, a background restart is not allowed to turn GPS back on, so the walk is closed at its last point and marked as ended early. A walk also stops itself after 4 hours.

### Smoothing the track

On the first real walk (212 points, median accuracy 4.7 m, 832 steps), the raw track jittered by about half a metre from point to point, which added about 7% to the measured distance. The app smooths it with a constant-velocity Kalman filter and a Rauch-Tung-Striebel backward pass, and the walk screen can switch between the smoothed and raw track. I decided against snapping routes to roads, for privacy.

---

## Problems along the way

- **A setting saved too early.** Saving the step goal as you typed stored the values in between: deleting "10000" passes through "100". Settings now save when you press Done or leave the field.
- **Moving to Room without losing a day.** Version 1 kept steps in DataStore. The upgrade copies them into Room in one crash-safe transaction; on the phone the day's 4,201 steps and the baseline came across exactly.
- **A test command that wiped history.** Running instrumented tests the standard way uninstalls the dev build and its data, so the project runs them through `am instrument` instead.

---

## Screenshot

The screenshot shows the Today and History screens on my phone. The Walks screens are left out because they draw real routes.

# Sensor Dashboard: Every Phone Sensor, Live and Recorded

## Overview

An Android app that shows a live reading from every sensor the phone reports (34 on a moto g 5G: 11 motion, 6 position, 2 environment, 15 other) and records any of them at full rate to an on-phone database for CSV export. It has no internet permission: nothing it reads can leave the phone.

| | |
|---|---|
| Stack | Kotlin, Jetpack Compose, Material 3, Room |
| Recording | Up to 400 Hz, up to 30 minutes, batched writes |
| Export | CSV through the system save dialog |
| Size | About 3,700 lines of Kotlin |
| Tests | 77 JVM tests, 6 on-device |
| Release | 2.0, 2.45 MB |

Screens: **Home** (every sensor grouped by category, each card with a 5-second sparkline and its rate), **Sensor detail** (a 10-second live chart per axis, minimum, maximum, mean and the measured rate, and Record), and **Recordings** (export or delete).

Some sensors get a picture of what they measure: a 3D orientation cube, a compass, a bubble level, relative altitude from the barometer, a log-scale light bar and a near or far proximity reading.

---

## Recording at full rate

Android caps apps that target Android 12 or later at 200 Hz. The `HIGH_SAMPLING_RATE_SENSORS` permission lifts that, so the accelerometer and gyroscope record at 400 Hz. An insert per event at that rate would make the UI stutter, so samples go through an unbounded channel drained on a background thread and are written every 500 ms in one transaction. A crash loses at most one batch, and an empty recording is deleted.

A recording is capped at 30 minutes, about 720,000 rows at 400 Hz. Each sample row has six value columns, because uncalibrated sensors report six values. Measured on the phone: a 5-second recording of the real accelerometer saved every sample at 350 to 450 Hz, with gravity reading about 9.8 m/s².

Sensors are read only while a screen is visible, at the rate that screen needs: slow on Home, faster on a detail screen, fastest while recording. The live chart runs at about 49 events a second, and the idle Home screen draws with no janky frames.

---

## Export

CSV goes through the system save dialog, so the app needs no storage permission. The header names each column for the sensor (`elapsed_s,x,y,z`, or the uncalibrated, rotation-vector and single-value variants), decimals always use a full stop whatever the phone's language (a test runs it under a German locale), and the export reads the table 5,000 rows at a time.

---

## Details that needed care

- **Barometric altitude.** The baseline and the current value are each a one-second average. A single first reading was an outlier and showed the phone 0.3 m below where it sat.
- **Compass.** It shows magnetic north. Correcting to true north needs your location, and this app never asks for it.
- **Orientation cube.** It shows rotation since the screen opened, and a tap re-centres it, with axes in the red, green, blue order robotics tools use.
- **A build for screenshots.** The debug build adds a deep link that opens any sensor's screen, so captures can be scripted over adb.

---

## Screenshot

The screenshot shows Home, the magnetometer's compass and the accelerometer's bubble level on my phone.

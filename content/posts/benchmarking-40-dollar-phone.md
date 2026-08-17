It cost forty dollars, it has 2 GB of RAM, the screen has a crack across the top third, and it is the most valuable piece of equipment I own. Every model I ship has to survive it first.

## The lie of the development machine

My laptop runs the model in 40 ms. The lab workstation runs it in 12. Both numbers are true and neither has ever predicted anything useful about how the app behaves in a coffee field.

The gap is not just raw speed. It is thermal throttling after the fourth consecutive inference. It is the OS killing your process because something else wanted memory. It is a camera pipeline that delivers frames in a format you did not plan for, on a device where the conversion costs more than the inference. None of that appears in a benchmark run on hardware with a fan.

> If your slowest test device is a MacBook, you have not tested. You have rehearsed.

## What it caught that profiling didn't

**Thermal throttling.** First inference: 380 ms. Tenth consecutive inference: 1,240 ms. The phone gets hot, the SoC downclocks, and the app that felt responsive in a thirty-second demo becomes unusable in the four-minute session a real user has. I now benchmark the *tenth* run, never the first.

**Memory pressure, not memory usage.** The model fit in RAM comfortably. It still got killed, because the user had WhatsApp open and the OS made a reasonable decision. Peak usage was fine; peak usage *while a real phone is doing real phone things* was not.

**Cold start.** 2.8 seconds to first inference after the app had been swapped out, almost all of it loading the interpreter and the model file from slow flash storage. On my laptop this was 200 ms and invisible. Memory-mapping the model file took it to 900 ms.

```
                        laptop      $40 phone
inference (1st run)      40 ms        380 ms
inference (10th run)     41 ms      1,240 ms   ← throttling
cold start              200 ms       2,800 ms
after mmap fix          200 ms         900 ms
```

![photo: the test phone, cracked screen and all]()

## How I actually use it

It sits on my desk, plugged in, with the app installed from the same artifact that would go to a user — never a debug build, never through the IDE. Three rules I keep:

**Benchmark warm, not cold.** Ten runs back to back, report the tenth. The first run is marketing.

**Never clear the other apps.** The realistic condition is a phone with fourteen things open and 200 MB free. Testing on a freshly rebooted device measures a situation no user is ever in.

**Test on battery, below 20%.** Android aggressively throttles in battery saver, and a farmer at the end of a working day is not at 100%. This one caught a 2× regression that every other test missed.

## Why forty dollars is the right number

I could have bought a mid-range phone and felt more comfortable. The point is not comfort. The device sets a floor: if it runs here, it runs everywhere my users are, and I never have to wonder.

It has also quietly made the models better. Every optimization I made to satisfy this phone — the memory mapping, the int8 quantization, the resumable download — improved the experience on good hardware too. Constraints propagate upward. They rarely propagate down.

The crack in the screen is from dropping it in a parking lot. I have not replaced it, partly because it still works and mostly because a slightly broken phone is more representative than a pristine one.

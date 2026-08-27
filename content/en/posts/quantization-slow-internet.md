Most quantization tutorials open with a throughput chart. Mine opens with a download bar, because that is where the problem actually starts. A 96 MB model is not slow to run on a mid-range Android — it is slow to *arrive*. On the connection most of my users have, 96 MB is somewhere between eleven minutes and never.

## The constraint nobody writes about

The literature optimizes latency. Latency matters, but it is the second problem. The first is that the model has to reach the device at all, over a connection that drops, on a data plan measured in hundreds of megabytes per month, onto a phone with 2 GB of RAM and 16 GB of storage that is already 90% full.

I set a hard budget before writing any code: **under 12 MB, installed**. Not "as small as we can get it" — a number, decided in advance, that a build could fail against. Everything downstream came from that decision.

> A size budget is not a limitation on the model. It is a specification of who gets to use it.

## What each technique actually bought

I tried these roughly in order of effort, measuring after each step rather than stacking them blindly.

**Post-training float16.** Free, one line, halves the file. Accuracy loss was under 0.2 points. There is no reason not to do this; it is the closest thing to a free lunch in the stack.

**Post-training int8 with a representative dataset.** This is where the real compression lives — another 2× on top of float16, so 4× total. The catch is the calibration set. My first attempt used 100 clean studio images and lost six points of accuracy in the field. Rebuilding calibration from 500 photos taken on the actual target phones, in actual field lighting, brought that back to 1.4 points.

```
baseline    fp32    96.4 MB    94.8% top-1
float16             48.2 MB    94.6% top-1
int8  (studio cal)  12.3 MB    88.9% top-1   ← calibration mismatch
int8  (field cal)   12.3 MB    93.4% top-1
+ pruning 30%       10.9 MB    93.1% top-1
```

**Structured pruning.** Worth it only after quantization, and worth less than the tutorials suggest. 30% channel pruning bought me 1.4 MB for 0.3 points. I kept it because it fit under the budget; I would have dropped it otherwise.

**Quantization-aware training.** The textbook answer, and the one I skipped. QAT needs a full retraining run, and on the hardware I had access to that was four days of GPU time I did not have. Post-training with good calibration got me within a point of where QAT would land. Know when the expensive technique isn't worth it.

![screenshot: size vs accuracy across quantization steps]()

## The calibration set is the whole game

If there is one thing to take from this: your calibration data must come from the deployment distribution, not the training distribution. Those are different things and nobody says so out loud.

My training set was clean, well-lit, centered photographs, because that is what makes a model train well. My deployment reality was a farmer holding a cracked phone at arm's length in overcast light. Calibrating int8 ranges on the first distribution and deploying to the second is how you lose six points and spend a week blaming the quantizer.

Five hundred field photos took an afternoon to collect and were worth more than every architecture experiment I ran that month.

## Where it landed

10.9 MB, 93.1% top-1, 380 ms on the target device, fully offline. It downloads in under two minutes on a bad connection and survives being interrupted, because I also split the download into resumable chunks — which turned out to matter as much as any of the above.

The model is 8.8× smaller than the baseline and 1.7 points worse. On paper that is a bad trade. In the field it is the difference between a tool people use and a tool people cannot install.

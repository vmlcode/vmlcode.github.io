The model was finished. Ninety-one percent on the validation set, a clean confusion matrix, a demo that made my advisor nod. Then I ran it, for fun, over three years of my own tweets — and it marked two-thirds of them as sarcastic with high confidence. My first reaction was that the model was broken. My second, arriving somewhere around 2 a.m., was worse.

## The bug that wasn't

Debugging a classifier that disagrees with you is a specific kind of humbling. I checked the obvious things first: tokenizer drift between training and inference, a label mapping flipped somewhere in the export, the sarcasm head reading logits from the wrong layer. All clean. The model was doing exactly what it had been taught to do.

So I did what you do when the code is fine: I read the data. Two hundred of my own examples, side by side with the model's per-token confidence, in a notebook at an hour I'd rather not report.

![screenshot: per-token confidence heatmap]()

The spikes were not where I expected. They were not on the obviously ironic constructions I had spent weeks curating. They were on diminutives — *-ito*, *-ita*, the softening suffixes that in my part of the world mean warmth roughly ninety percent of the time.

## What the labels actually said

The sarcasm subset had been labeled by six people, all of them my friends, most of them from the same city. When they marked something sarcastic they were, without meaning to, marking a register: the affectionate exaggeration we all use constantly — the diminutives, the mock-formal address, the compliments delivered two sizes too large.

That register is most of how I write online. The model hadn't learned to detect sarcasm. It had learned to detect us.

> A dataset is a group of people agreeing, in writing, about what a word means. Mine agreed a little too much.

The uncomfortable part is that nothing in my metrics could have caught this. The validation set was drawn from the same pool as the training set, labeled by the same six people. Of course it scored 91%. It was being graded by the people who wrote the answer key.

## The fix, in three parts

First, I re-recruited: twelve labelers across four regions, none of whom knew each other, with an explicit instruction that warmth is not sarcasm. Second, I measured inter-annotator agreement **per phenomenon** rather than overall, which immediately exposed diminutives as the fault line. Third — and this is the part I'd repeat on any project — I kept a held-out set written by people whose speech the original labelers would have gotten wrong.

```
>>> agreement(subset="diminutives")
kappa 0.31 — below the floor; flagged for re-label
>>> agreement(subset="irony_explicit")
kappa 0.78 — keep
```

That single table did more for the model than any architecture change I tried. A kappa of 0.31 means the labelers were barely agreeing with each other; averaged into a global score of 0.68 it had looked perfectly healthy.

Recall on the sarcasm head dropped from a flattering 91% to a believable 82%. The demo got quieter and considerably more useful. It no longer thinks I am being mean to my own mother.

## What it cost, what it bought

Six weeks and nine points of recall, for a model that is honest about a language it was always going to be judged on. I'd spend it again.

If you take one operational thing from this: compute agreement per phenomenon, not per dataset. Global kappa is an average, and averages are exactly where this kind of problem goes to hide.

The uncomfortable conclusion I promised in the subtitle isn't about my tweets — it's that the most confident version of a model is usually the one that has learned the smallest room.

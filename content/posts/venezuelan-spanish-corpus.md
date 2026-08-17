There is no Venezuelan Spanish corpus. There are Spanish corpora — excellent ones, mostly Peninsular, some Mexican and Argentine — and every one of them reads my country's speech as slightly wrong. So I built one. Twelve thousand comments, four months, and more arguments about the word *vale* than I expected to have in a lifetime.

## Why the existing corpora fail here

It is not vocabulary. Vocabulary is the easy part and the part everyone fixes first.

It is that regional Spanish differs in *pragmatics* — what a construction does, not what it means. A Peninsular model reads `¿me haces el favor?` as a polite request. Here, depending on tone and context, it can be a genuine request, mild exasperation, or an outright threat. No amount of vocabulary augmentation teaches that, because the words are identical.

![screenshot: same phrase, three regional readings]()

## Collection, and the consent problem

I scraped nothing. That was a decision I made early and it cost me perhaps three months.

Public comments are technically available, but "technically available" is not consent, and I was building a dataset about how specific communities speak. Instead I recruited: local Facebook groups, my university, two neighbourhood WhatsApp groups, a coffee cooperative. Everyone knew what they were contributing to, and everyone could withdraw their text later. Four people did.

> Twelve thousand consented examples took four months. Two hundred thousand scraped ones would have taken a weekend and I would not be able to publish either the dataset or my conscience.

The recruitment also fixed a sampling problem I would not have caught otherwise. My first thousand examples came almost entirely from university students aged 19–24. That is a dialect, not the dialect.

## The annotation guide is the real artifact

I rewrote it eleven times. The model is downstream of it; every ambiguity in the guide becomes noise in the labels and then a confident error at inference.

The single biggest improvement was replacing abstract categories with **decision trees over concrete questions**. Not "is this sarcastic?" — which produced a kappa of 0.31 and a great deal of shouting — but a sequence: Is the literal reading plausible? Does the speaker signal distance from it? Would the addressee be offended if the literal reading were true?

```
guide v3    "is this sarcastic?"              kappa 0.31
guide v7    3-question decision tree          kappa 0.59
guide v11   + worked examples per branch      kappa 0.74
            + explicit "warmth ≠ sarcasm"
```

Eleven versions of a document moved agreement more than any modelling decision I made that year. Nobody puts that in a paper.

## Three labeling disagreements per family dinner

I recruited across four regions specifically so the labelers would *not* know each other. Homogeneous annotators agree beautifully and teach the model their own small room — I had already learned that the expensive way.

The disagreements were the useful signal. Where labelers from Táchira and from Zulia split consistently on the same construction, that construction went into a separate regional-variation subset instead of being resolved by majority vote. Majority vote would have silently deleted a real dialect feature and replaced it with a confident average of two things that are not the same.

The corpus ships with per-item agreement scores attached. If you use it, you can see exactly where we were unsure, which seems like the minimum honest thing to do.

## What exists now

12,438 comments, four regions, three annotation layers, per-item agreement, and a guide that took eleven drafts. It is small by the standards of the field and it is the only thing of its kind that I know of.

Next: getting it hosted somewhere permanent, with a licence that lets other Venezuelan students use it without asking me. That part is administrative and I have been avoiding it for two months.

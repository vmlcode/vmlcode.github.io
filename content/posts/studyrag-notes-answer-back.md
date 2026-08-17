Four semesters of notes: half handwritten, half typed, none searchable, all of them needed the night before an exam. StudyRAG started as a search box over my own handwriting and turned into the most useful thing I have built, for reasons that had almost nothing to do with the retrieval.

## OCR is 80% of the work and 0% of the fun

Nobody's RAG tutorial starts with "first, fix your handwriting." Mine had to.

Tesseract on raw phone photos of lecture notes produced text that was roughly 60% correct — unusable, because the errors cluster exactly on the technical terms that matter. `eigenvalue` became `eigenvatue`, `tensor` became `fensor`, and every one of those is a term you would actually search for.

What fixed it, in order of impact: deskewing and adaptive thresholding before OCR at all; a custom word list of course terminology passed to Tesseract; and a fuzzy correction pass against that same list afterwards. That took accuracy to about 94%, which is enough — because retrieval is robust to noise in a way that exact search is not.

> A search box needs the text to be right. A retrieval system needs it to be close. That gap is where this project became possible.

## Chunking by structure, not by length

My first version chunked every 512 tokens with 50 token overlap, because that is what everyone does. Results were mediocre in a way I could not immediately explain.

The problem is that lecture notes have structure, and fixed-size windows destroy it. A definition and its worked example would land in different chunks; retrieval would return the example without the definition, and the answer would be confidently missing half its context.

Chunking on the structure instead — heading, definition block, worked example, each its own chunk with the parent heading prepended — improved retrieval quality more than swapping the embedding model did.

```
fixed 512-token windows        useful answer in top-3:  61%
+ heading prepended                                     72%
structural chunks                                       84%
+ page number in metadata                               84%  (but citable)
```

That last row is the important one. It changed no numbers and made the system trustworthy.

## Citations were the actual feature

I added source citations as a debugging aid. I wanted to know which chunk an answer came from so I could tell whether the retrieval or the generation was at fault.

They turned out to be the product. Once every answer carried "notes, week 6, page 3," two things happened. I started catching hallucinations immediately, because a wrong answer usually cites a page that obviously does not support it. And I started *using* the answers differently — following the citation back to the original page and reading around it, which is the thing I should have been doing all along.

![screenshot: an answer with its source page cited]()

The system stopped being an oracle and became an index with opinions. That is a much better thing to have the night before an exam.

## It reproduces my mistakes, which is useful

It answers in the wording of my own notes — including the places where my notes are wrong.

I found three genuine errors in my linear algebra notes this way: the system confidently told me something incorrect, I followed the citation, and there it was in my own handwriting from eighteen months earlier. A general-purpose model would have quietly given me the right answer and I would still believe I had understood it at the time.

## What I would tell someone starting one

Spend your time on the corpus, not the model. Every meaningful improvement I made was upstream of retrieval: the OCR pass, the chunk boundaries, the metadata. I swapped embedding models twice and it moved almost nothing.

And cite your sources from day one, even in a prototype that only you will use. A retrieval system is only as honest as its citations, and you will not notice it lying to you until you can check.

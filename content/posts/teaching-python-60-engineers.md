Sixty classmates, eight weeks, one whiteboard, and a room where roughly half the people had already decided they were "not a programming person" before I said anything. That last part turned out to be the actual curriculum.

## Loops were never the problem

I lost the first two weeks teaching syntax. `for`, `while`, `range`, indentation, the usual. People could write a loop by week two and still could not tell me *why* they would want one. They had learned a shape, not an idea.

The thing that finally worked was refusing to write code at all for a full session. Instead: describe, out loud, in Spanish, how you would explain to your grandmother the steps for making sixty arepas when you know how to make one. Someone said "you do the same thing sixty times but you change what's in your hand each time." That is a loop. We wrote it on the board in words, and only then in Python.

> They did not need to be taught loops. They needed permission to notice they already thought in them.

## Three things that measurably helped

**Errors on purpose, early.** In week one I had everyone deliberately write broken code and read the traceback out loud. Beginners treat an error as a verdict on themselves; by week three the room treated a traceback as a sentence with a line number in it. Attendance stopped dropping after that week, which I do not think is a coincidence.

**No slides after week three.** I typed everything live, including the mistakes. Watching me get an `IndentationError` and fix it in eight seconds taught more than any correct example did. The competence people needed to see was not "writes perfect code" — it was "gets stuck and gets unstuck routinely."

**Pairs, reshuffled weekly.** Fixed pairs calcify into one driver and one passenger. Reshuffling meant everyone was the confused one at some point, which killed most of the status anxiety in the room by about week five.

## The part I got wrong

I graded the first two assignments on correctness. That was a mistake and it cost me most of week four.

People stopped experimenting. They wrote the smallest thing that would pass and submitted it. When I switched to grading on *documented attempts* — show me what you tried and what the error said — the submissions got longer, worse, and far more interesting. One person turned in four broken approaches and a paragraph about why the third almost worked. That was the best assignment I received all term.

```
week 1   attendance 60   "I'm not a code person"     × 11 overheard
week 4   attendance 41   grading on correctness      ← my fault
week 5   attendance 52   grading on attempts
week 8   attendance 57   final projects, 6 unprompted extensions
```

I keep that table because the dip is mine. It is easy to read a drop in attendance as a fact about students.

## What I actually learned

Explaining a thing is the fastest way to find the holes in your own map of it. I thought I understood scope until someone asked why a variable inside a function "disappears," and I heard myself give an answer that was true, useless, and clearly memorised rather than understood. I went home and read about frames properly that night.

By week eight they navigated without me, which is the only outcome that counts. Six of them extended their final project past the requirements without being asked. One of them is now in the CV lab with me.

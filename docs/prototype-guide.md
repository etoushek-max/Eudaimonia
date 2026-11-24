# Coach Prototype — Two-Week Test

Goal: find out whether the coach actually helps you live closer to your vision **before** we build the app. David and Ethan each run it separately for two weeks.

## Setup (10 minutes, once each)

1. In Claude (claude.ai or the Claude phone app), create a new **Project** called "Eudaimonia".
2. Open the project's **instructions** and paste in the full contents of [`src/coach/coach-instructions.md`](../src/coach/coach-instructions.md).
3. Start a chat in the project and say "Hi". The coach will run the onboarding interview.
   - On your phone, use the microphone button to **answer by voice** — this simulates the app's voice answers.
4. At the end, the coach gives you a **Vision Profile**. Add it to the project's **knowledge** (as a text file or pasted text) so the coach remembers you in every new chat.
5. Set your own check-in reminder in your **phone calendar** at the time you told the coach (this tests the calendar-reminder idea). Put a short line of encouragement in the event title.

## Daily (1–2 minutes)

- When your reminder fires, open the project and check in ("Check-in" is enough).
- Use one chat per week for check-ins so the coach can see the week; start a new chat for the next week.
- Fill in one row of your feedback log (below).

## Weekly (10 minutes)

- Ask the coach for your **weekly review**.
- Replace the Vision Profile in project knowledge with the updated one it gives you.
- Swap notes with each other: what worked, what annoyed you.

## Feedback log

Keep this in a shared note or spreadsheet. One row per day:

| Date | Did the check-in? | Habits done | Helpful (1–5) | Felt nagged (1–5) | Felt understood (1–5) | Best or worst coach reply (copy it) | Notes |
|---|---|---|---|---|---|---|---|

**Copy the coach's best and worst replies word for word.** These become the examples we use with dspy.ts to measure and improve the coach.

## What we're testing

1. **Onboarding:** was ~10 minutes enough? Did you get real value at the end (vision, insight, picture, first habits)?
2. **Daily check-ins:** quick enough? Supportive or naggy?
3. **The dig:** when you missed a habit, did it help you understand why and re-plan — without shame?
4. **Tone dial:** did your chosen style feel right? Did you change it?
5. **Habits:** did you actually do more of what you said you wanted?
6. **Memory:** did it feel like the coach knew you?
7. **Dependency:** did you ever want to talk to the coach *instead of* a person? Did it push you toward people?
8. **Voice answers:** did talking feel easier or more honest than typing?
9. **Safety:** did it ever give advice that felt risky (diet, mental health, relationships)?

## End of test (together, ~1 hour)

- Score each of the 9 questions above.
- List the top 5 changes to the coach instructions.
- Decide: is the coach good enough to build the app around, or do we iterate on the instructions first?
- Update the instructions in `src/coach/` and commit, so every change is tracked.

## Limits of this prototype

Compared with the real app, there are no automatic notifications, no vision-picture images, no habit tracking screen, and memory is manual (the saved Vision Profile). The coach also runs on a strong model here; the app will use a cheaper model for routine check-ins, so we'll need to re-test that later.

# Running the Eudaimonia prototype app

## One-time setup

1. **AI key.** For now the coach runs on a free **Google AI Studio** key: create one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). On the free tier Google may use what's sent to improve its products, so test with made-up details, not real personal stories. (Later: a Claude key from [platform.claude.com](https://platform.claude.com), billed separately from a Claude subscription.)
2. Copy `.env.example` to `.env` in the project folder and paste the key after `GEMINI_API_KEY=`. `.env` is git-ignored; never commit it or put the key anywhere in `src/`. If only `ANTHROPIC_API_KEY` is set, the coach uses Claude; with both, set `COACH_PROVIDER=claude` to choose Claude.
3. Install packages: `npm install`.
4. On your phone, install **Expo Go** (App Store / Google Play).

## Run it

```powershell
npx expo start
```

- **Phone:** scan the QR code with the camera (iPhone) or Expo Go (Android). Phone and computer must be on the same Wi-Fi. The app calls the coach through your computer, so keep the terminal running.
- **Browser:** press `w` in the terminal.

Restart the server after changing `.env`.

## How it fits together

| Part | File | What it does |
|---|---|---|
| Coach server route | `src/app/api/coach+api.ts` | Receives the conversation from the app, validates it, calls the AI. Holds the API key; the app never sees it. |
| AI connection | `src/server/coach.ts`, `src/server/gemini.ts` | Builds the request: coach instructions (`src/coach/coach-instructions.md`) + app rules + today's context. With a Gemini key: `gemini-3.8-flash`, and `gemini-3.5-flash-lite` for check-ins (override with `GEMINI_MODEL` / `GEMINI_CHECKIN_MODEL`). With a Claude key: Claude Opus 5.5, and Claude Haiku 5.5 for check-ins. |
| Today | `src/app/index.tsx` | Today's habits, done / not today, add a habit, add habits to calendar. |
| Coach | `src/app/coach.tsx` | Chat with the coach, plus a short daily check-in thread. Tap 🎙 to answer by voice: the recording is transcribed (`src/app/api/transcribe+api.ts`, Gemini) into the text box to check before sending. |
| Week | `src/app/week.tsx`, `src/lib/week.ts` | This week's plan: calendar strip + day-by-day list of habits (on their days) and one-off items. "Plan my week with my coach" fills it; items can be added by hand and sent to the phone calendar. |
| Life map | `src/components/life-map.tsx`, `src/lib/life-map.ts` | First step of onboarding: rate all 11 life areas 1–10 (wheel fills in), pick up to 3 focus areas, say why now. Retake from the Vision tab; the old map shows as a dashed line. |
| Area playbooks | `src/coach/playbooks/*.md` | Leading frameworks, questions, habits and limits per coached area. The server loads the ones for the user's focus areas. |
| Progress | `src/app/progress.tsx` | Vision panels that gain colour as habits are done (never fades), 14-day history per habit, weekly review. |
| Vision | `src/app/vision.tsx` | Life map wheel and retake, the saved Vision Profile, delete-all-data. |
| Data | `src/state/store.tsx` | Everything is stored on the device only (AsyncStorage). |

When the coach outputs a Vision Profile, the app saves it and creates habits from its "Active habits" table automatically.

## Calendar

"Add habits to my calendar" creates a calendar file with one daily event per habit (at its time, with an alert and a line of encouragement) and opens it, so the phone's calendar app adds them. Expo Go can't write to the calendar directly; a development build can switch to `expo-calendar` later. "Discreet titles" hides habit names for shared calendars.

## Tests

```powershell
npx tsx tests/profile.test.ts
npx tsx tests/life-map.test.ts
npx tsx tests/week.test.ts
```

## Known limits of this prototype

- No accounts or cloud sync: data lives on one device.
- No push notifications yet (reminders come from the calendar).
- Vision picture is coloured panels with the coach's scene text, not AI images yet.
- Voice input needs the Gemini key (Claude doesn't take audio); recordings are sent to Google for transcription and not stored.
- The coach's replies show markdown (e.g. **bold**) as plain text.

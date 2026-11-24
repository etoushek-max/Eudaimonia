# Eudaimonia — Product Spec (v0.1, draft)

_Owners: David, Ethan · Last updated: 2026-11-23_

## Vision

Eudaimonia is an AI life coach in your pocket. It helps people define what a flourishing life means *for them*, build the habits and systems to create it, and walks with them every day — holding them accountable with both challenge and kindness.

It judges progress by eudaimonia (the long-term life a person says they want), not by moment-to-moment happiness. Sadness, grief, anger and failure are part of the road, not signs of being off it.

## The three jobs

1. **Discover** — learn what eudaimonia means to this person across every area of life: short-term, near-term and long-term.
2. **Build** — turn that vision into concrete goals, habits and plans that set them up to succeed.
3. **Walk with them** — daily check-ins on what they said they'd do, digging into why when they don't, and helping them stay kind to themselves through failure.

## Structure: meta coach + area coaches

One **meta coach** holds the person's whole life vision and decides where attention goes. Underneath it sit **area coaches**, each with its own methods, measures and safety rules.

Life areas (long-term roadmap):

| Area | Notes |
|---|---|
| Body | Fitness, nutrition, sleep, weight |
| Time & attention | Screen time, gaming, work hours |
| Mental health | Mood, stress — coaching only, never therapy |
| Relationships | Friends, family, partner, community |
| Purpose & spirituality | Meaning, values, practice |
| Career | Work, skills, ambition |
| Money | Finances, stress, freedom |
| Contribution & service | Volunteering, giving |
| Home & environment | Cleanliness, space |
| Learning & growth | Reading, skills, curiosity |
| Play & rest | Fun, recovery, hobbies |

## MVP scope

**Approach:** full meta coach from day one, but only one or two area coaches go deep.

- **Discovery covers every area.** Onboarding conversation produces a written personal vision across all life areas.
- **Deep coaching at launch:** **Body**, **Time & attention**, and **Relationships** (habits model — see below). These get habits, check-ins, tracking and accountability.
- **Relationships scope:** relationship *habits* are in (call a friend weekly, host a dinner, family time). Relationship *counseling* is out (breakups, conflict mediation, abuse → referral to human professionals and crisis lines).
- **Other areas:** the coach can discuss them generally; full coaching marked "coming soon."
- **Architecture:** area coaches are modules under the meta coach, so adding one is configuration, not a rebuild.

### MVP features

- Onboarding interview → personal vision document (editable) + vision picture (see below)
  - **Adaptive, like a first session with a therapist or coach** — not a static intake form. The AI follows a guide of life areas to cover, but asks follow-up questions based on each answer to dig deeper.
  - **Voice answers (no video).** Each turn, the user can type or record their answer; it's transcribed and they can correct the text before sending. Questions can optionally be read aloud. Turn-based, not live conversation.
- Goals + up to 3 active habits at a time
- Check-ins via push notification; **the user decides how often check-ins happen**
- Coach chat with memory of the vision, goals, habits and history
- Weekly review: what went well, what didn't, what to adjust
- User-chosen coach tone (gentle ↔ tough)
- Periodic well-being check (based on Ryff's psychological well-being scale) to show progress beyond streaks

### Not in MVP

Health/screen-time integrations, community/social features, payments, area coaches beyond the launch set, accountability buddy, Google/Microsoft calendar accounts, the agentic coach (phase 2).

## Day-one value

Principle: anyone who spends time on the interview must get a lot back immediately.

- **Short first interview** (~10 min, 2–3 areas) that already delivers the payoff; later conversations deepen it.
- At the end they receive: **their vision picture**, **a written vision in their own words**, **one insight they didn't expect** ("you mentioned your kids in every area"), and **1–2 tiny first habits** ready for tomorrow.

## Vision picture

An AI-illustrated picture of the life they described, which gains colour as they make progress.

- **Built from panels, one per life area** (a trail run, a home, a family table, a workplace) composed into one scene. Each panel is generated once in full colour; the app shows it as a pencil sketch and reveals colour progressively. No regeneration needed.
- **Illustration, not photo.** Stylised (e.g. watercolour/sketch). Shows the *life*, never an idealised body shape or weight. User chooses how they're represented; no face photos.
- **Colour is never taken away.** Neglected areas stop gaining colour but keep what was earned.
- **Rewards consistency, not perfection** (e.g. 5 of 7 workouts, completing a weekly review, honest reflection after a miss).
- **Vision can evolve.** Users can update it; old pictures are kept as a timeline of how their vision grew.
- **Paired with obstacles (WOOP).** The picture shows the destination; the coach asks what will get in the way.
- **Cost:** one set at onboarding; regenerations limited on the free tier.

## Check-ins & reminders

Principle: a reminder is support when it's the user's own plan, nagging when it's the app's demand.

**Default design:**
- **Plans in their own words.** Habit setup captures when/where ("Tuesday 7am, before work, I run"); reminders quote it back.
- **One evening check-in** covering the day's habits by default. Pre-habit reminders are opt-in per habit.
- **Ask, don't command** ("How did the run go?" not "Time to run!").
- **Back off when ignored.** After 3 ignored check-ins, reduce frequency and ask once in-app whether the plan still fits.
- **Fade as habits stick.** Consistent habits get fewer reminders.
- **Kind with misses.** No guilt the day after one miss; after two in a row ("never miss twice"), one supportive message asking what got in the way.
- **Quiet hours, varied wording,** and the gentle ↔ tough tone dial apply.
- **Encouragement in every reminder**, rotating: their own *why*, identity ("every run is a vote for who you're becoming"), real progress ("3rd run this week"), short lines from Aristotle / Marcus Aurelius / Seneca / Epictetus (public domain), small practical tips. Cheap model writes a week's worth in one batch, matched to tone.

**Reminder method, chosen per habit:** app notification, calendar event, or none. The evening check-in stays in the app either way.

**Calendar (launch):** write habit events to the phone's own calendars (Google/iCloud/Outlook via the device; no account sign-in). Short encouragement in the event title, longer message in notes. Only the next 1–2 weeks are written, with varied text, refreshed when the app is opened.

**Later:** accountability buddy (a friend gets a weekly summary/nudge); Google/Microsoft calendar accounts for fresh text per event and free-time-aware scheduling.

## Security & privacy

- **Sign in once** (Sign in with Apple, Google, or passkey) and stay signed in — no sign-in on every open, so check-ins stay fast.
- **Optional app lock** (Face ID / fingerprint / PIN), recommended during onboarding, re-locks after ~5 minutes in the background.
- **Discreet notifications** ("Your check-in is ready"), on by default for mental health and relationships.
- **Discreet calendar titles** option ("🌱 Eudaimonia: morning habit") for shared calendars.
- **Blur the app in the app switcher.**
- Tokens in the phone's secure storage; data encrypted in transit and at rest; tightly limited access.
- Users can **sign out other devices** and **delete all their data** from settings.

## Phase 2: Agentic coach

The meta coach becomes proactive: it decides what to do, when, and which area coach to involve, instead of following fixed rules.

- **How it runs:** event-driven wake-ups, not a constantly running agent. Triggers: scheduled plan times (e.g. a 5pm run), user actions (logged, skipped, ignored), a daily planning pass, the weekly review.
- **Daily planning pass:** once a day per user (cheap model), the meta coach reviews the person's state and decides the day's touchpoints — which, when, which area coach, what tone.
- **Area coaches as specialists:** each has domain knowledge and methods; the meta coach routes to them.
- **Tools the agent can use:** send a message, schedule a follow-up, write a calendar event, adjust a plan (e.g. offer a 20-min version), note something to memory, escalate a crisis.
- **Self-review:** the meta coach checks whether coaching is working (adherence trends, engagement, well-being score) and changes strategy — easier habit, new timing, different approach.
- **AI decides what; code decides how much.** Hard limits enforced in code, not left to the AI: the user's check-in frequency is a ceiling, quiet hours, back-off rules, daily message caps, deterministic crisis handling.
- **Transparency:** users can see why the coach did something and turn proactivity down.
- **Testing:** simulated users to test coach behaviour before release.
- **Voice calls (paid tier):** live, real-time voice conversation with the coach. Users can book calls ("Sunday 7pm weekly review call") and opt in to "call me if I'm slipping." Calls ring as an in-app incoming call (iOS CallKit / Android equivalent). Explicit, revocable consent; short and purposeful; the code-enforced limits apply.
- **Crisis is never handled by an AI call** — route to human crisis lines (e.g. 988 in the US) and a user-chosen emergency contact.
- **Not planned:** FaceTime (no API for this), AI avatar video, using the user's camera.
- **Phase 1 groundwork:** build phase 1 on the same loop — rules decide *when*, AI writes *what* — so phase 2 swaps the rules for AI decisions instead of rebuilding.

## Coaching method

Drawn from established research and philosophy:

- **Eudaimonic well-being:** Ryff's model, Self-Determination Theory (autonomy, competence, relatedness), Seligman's PERMA
- **Philosophy:** Aristotle (virtue, flourishing), the Stoics
- **Habits:** *Atomic Habits* (James Clear), *Tiny Habits* (BJ Fogg), implementation intentions, WOOP
- **Accountability conversations:** motivational interviewing — challenge without shaming
- **Kindness:** self-compassion (Kristin Neff); "never miss twice" instead of streak shame

## Principles & safety

- **It's a coach, not a therapist.** Never marketed or framed as therapy (several US states restrict AI therapy).
- **Crisis detection from day one.** Signs of self-harm, abuse or crisis → hand off to crisis lines and human professionals.
- **No dependency.** Success is measured by the person's life, not time in the app. Check-ins are short. The coach regularly points people toward real people. A coach that becomes someone's primary relationship has failed.
- **Privacy is the trust model.** No ads, no selling data. Sensitive data encrypted.

## Pricing & AI cost

- **Free tier:** discovery across all areas + deep coaching in **two areas of growth** of the user's choice. Runs on a cheaper AI model.
- **Paid tier:** deep coaching in **all areas** (all launch coaches now; new coaches as they ship).
- **Routine check-ins use a cheap model** for every tier; deeper conversations (onboarding, weekly review, "why didn't I?" digs) can use a stronger model.

## Decisions log

- 2026-11-23 — Launch coaches: Body, Time & attention, Relationships.
- 2026-11-23 — Relationships uses the habits-not-counseling model (resolves David/Ethan debate).
- 2026-11-23 — Free = 2 areas on a cheaper model; paid = all areas. Cheap model for routine check-ins.
- 2026-11-23 — User controls check-in frequency.
- 2026-11-23 — Check-in/reminder design, device-calendar reminders, security approach, vision picture and day-one value principle adopted.
- 2026-11-23 — Agentic meta coach planned for phase 2, with phase 1 built on the same loop.
- 2026-11-23 — MVP interview is adaptive with turn-based voice answers (no video). Live voice and coach calls are phase 2.

## Open decisions

- **Paid tier price.**

## Next steps

1. Agree on this spec (resolve open decisions).
2. Prototype the coach: write the coach's instructions; David and Ethan use it daily for two weeks before building the app.
3. Build the MVP app: Expo (React Native) mobile app + backend for accounts, data and AI calls (API keys stay on the server).

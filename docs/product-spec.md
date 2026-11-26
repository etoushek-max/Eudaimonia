# Eudaimonia — Product Spec (v0.1, draft)

_Owners: David, Ethan · Last updated: 2026-11-25_

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

- **Discovery covers every area — assess everything, coach a few.** The life map (below) asks about all 11 areas, so the coach knows the whole person and where help is wanted, even in areas it doesn't coach yet. The onboarding conversation then produces a written personal vision.
- **Deep coaching at launch:** **Body**, **Time & attention**, and **Relationships** (habits model — see below). These get habits, check-ins, tracking and accountability.
- **Relationships scope:** relationship *habits* are in (call a friend weekly, host a dinner, family time). Relationship *counseling* is out (breakups, conflict mediation, abuse → referral to human professionals and crisis lines).
- **Other areas:** the coach can discuss them generally; full coaching marked "coming soon."
- **Architecture:** area coaches are modules under the meta coach, so adding one is configuration, not a rebuild.

### MVP features

- **Life map first** (see below): a visual, 2-minute start before any chat — rate each life area, pick where you want change, say why now
- Onboarding interview → personal vision document (editable) + vision picture (see below)
  - **Adaptive, like a first session with a therapist or coach** — not a static intake form. The AI follows a guide of life areas to cover, but asks follow-up questions based on each answer to dig deeper.
  - **Voice answers (no video).** Each turn, the user can type or tap the in-app mic to record their answer; it's transcribed and they can correct the text before sending. Questions can optionally be read aloud. Turn-based, not live conversation.
- Goals + up to 3 active habits at a time, each on chosen days (daily, weekdays, Mon/Wed/Fri…)
- **Week tab:** this week's plan as a calendar strip and a day-by-day list — habits on their days plus one-off actions (call Mum, meal prep, book a physio). The weekly review ends by planning the coming week with the coach, which fills it in; users can add items themselves and send the week to their phone calendar.
- Check-ins via push notification; **the user decides how often check-ins happen**
- Coach chat with memory of the vision, goals, habits and history
- Weekly review: what went well, what didn't, what to adjust
- User-chosen coach tone (gentle ↔ tough)
- Periodic well-being check (based on Ryff's psychological well-being scale) and life map retakes to show progress beyond streaks

### Not in MVP

Health/screen-time integrations, community/social features, payments, area coaches beyond the launch set, accountability buddy, Google/Microsoft calendar accounts, the agentic coach (phase 2).

## Day-one value

Principle: anyone who spends time on the interview must get a lot back immediately.

- **Short first interview** (~10 min, 2–3 areas) that already delivers the payoff; later conversations deepen it.
- At the end they receive: **their vision picture**, **a written vision in their own words**, **one insight they didn't expect** ("you mentioned your kids in every area"), and **1–2 tiny first habits** ready for tomorrow.

## Not just a chatbot

Feedback from the first prototype test (David, 2026-11-25): onboarding felt like any free AI chat. People won't pay for what ChatGPT, Gemini or Claude give them for free. What makes Eudaimonia different, and must be visible from the first minute:

- **Less typing, more doing.** Visual and tap-based steps (life map, pickers, quick replies) wherever a structured answer works; typing only where their own words matter.
- **They leave with things, not just advice.** After the first session: life map, written vision, vision picture, and habits already in their calendar.
- **It remembers and comes back.** The coach holds the vision and history, checks in, notices patterns, and re-measures the life map so change is visible over time.
- **Visible expertise.** Every area coach works from named, leading frameworks and says so in plain words ("this is a Gottman technique"), so users can see the method behind the advice.

## Life map

The visual first step of onboarding, based on the coaching "Wheel of Life" and the domains of the Harvard Human Flourishing measure (VanderWeele).

1. **Rate every area 1–10** for how satisfied they are now. A wheel fills in as they tap, so they see their life at a glance.
2. **Pick up to 3 areas** where they most want change.
3. **"What made you download Eudaimonia today?"** — the real reason they're here, in their words.

The coach receives the map and opens the first session from it (reflecting one pattern, then going deep on their chosen areas) instead of asking generic questions. Areas we don't coach yet are still known, so the coach can keep them in view or point to other help.

**Re-measure:** the user can retake the life map any time (prompted roughly monthly). The wheel shows the previous map as an outline, and the coach reflects on what changed. This is a progress measure beyond streaks, alongside the periodic well-being check.

## Area playbooks

Each area coach is a **playbook**: a file with the leading frameworks for that area, its interview questions, its go-to techniques and habits, and its limits (when to refer out). The meta coach loads only the playbooks for the user's focus areas. Adding an area = writing and testing a playbook, not rebuilding the app.

**Core method (every area):** Motivational Interviewing (Miller & Rollnick) for how the coach talks; Self-Determination Theory (Deci & Ryan) for autonomy and motivation; WOOP (Oettingen) and implementation intentions (Gollwitzer) for plans; Tiny Habits (Fogg) and *Atomic Habits* (Clear) for habit design; self-compassion (Neff) for setbacks.

| Area | Leading frameworks | Limits | Status |
|---|---|---|---|
| Body | Physical activity guidelines (WHO/ACSM), progressive overload; Precision Nutrition coaching method; CBT-I sleep principles | No calorie targets or weight-loss regimes; medical and disordered-eating referral | Launch |
| Time & attention | Cal Newport (*Deep Work*, *Digital Minimalism*); Oliver Burkeman (*Four Thousand Weeks*); Nir Eyal (*Indistractable*) | No moralising; addiction signs → professional help | Launch |
| Relationships | Gottman Institute research (bids, 5:1 ratio, rituals of connection); attachment theory; Nonviolent Communication (Rosenberg) | Habits, not counselling; abuse → crisis protocol | Launch |
| Mental health | Positive psychology (Seligman, PERMA); behavioural activation; ACT (Hayes) | Coaching for well-being, never therapy or diagnosis | Roadmap |
| Career | *Designing Your Life* (Burnett & Evans); *So Good They Can't Ignore You* (Newport); career capital (80,000 Hours) | — | Roadmap |
| Money | Conscious spending (Ramit Sethi); Bogleheads principles; behavioural finance | Education and habits only — never personal investment advice | Roadmap |
| Purpose & spirituality | Aristotle and the Stoics; values work (ACT); Frankl | Respect all beliefs; no religious direction | Roadmap |
| Other areas | Playbooks written as each area is added | — | Roadmap |

**Quality:** each playbook gets a small test set of example conversations, used to check the coach actually applies its frameworks rather than generic advice (dspy.ts, see Technology). Before launch, have the playbooks reviewed by practising coaches in each area.

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

## Technology

**Principle:** boring, proven technology for anything holding user data; newer tools only where they add clear value and can be swapped out.

**Foundation**
- **App:** Expo (React Native) for iOS and Android.
- **Backend:** Postgres with vector search (pgvector), hosted on a managed platform such as Supabase — encryption, per-user access control, backups and simple "delete all my data."
- **AI calls run on the server only;** API keys never ship in the app. A cheap model handles routine check-ins; a stronger model handles onboarding, weekly reviews and deeper conversations.

**From Reuven Cohen's (ruvnet) open-source stack** — all MIT-licensed on npm:

| Tool | What it does | How we use it | When |
|---|---|---|---|
| **dspy.ts** | Automatic prompt optimisation against examples and a quality score (TypeScript port of Stanford's DSPy) | Measure and improve coach quality; help the cheap model approach the strong model's quality (lowers AI cost). Pairs with simulated-user testing. Works on prompts, holds no user data. | Coach prototype |
| **AgentDB / RuVector** | Vector memory that learns which memories were actually useful | Pilot as coach memory behind a swappable memory interface; adopt only if it recalls better than pgvector | Pilot during MVP build |
| **Ruflo** | Coordinates AI coding agents (already installed on the dev machine) | Development tooling only, used selectively — not part of the app | Now, as needed |
| **MidStream** | Analyses an AI reply while it's still streaming | Possible safety gate for live voice calls (catch crisis language mid-reply) | Evaluate in phase 2 |

**Not using:** agentic-flow (model switching is a few lines of our own code), SAFLA (Python; overlaps AgentDB), RuView (WiFi presence/vital-sign sensing — not relevant and too invasive for a privacy-first app).

**Caution:** the ruvnet projects move very fast (often several releases a week) and are largely single-maintainer. Before adopting any in production: pin exact versions, review the code, and keep it behind an interface we control.

## Pricing & AI cost

- **Free tier:** discovery across all areas, vision picture, + deep coaching in **one area of growth** of the user's choice. Runs on a cheaper AI model.
- **Paid tier — $14.99/month or $99/year:** deep coaching in **all areas** (all launch coaches now; new coaches as they ship). Annual plan is the promoted option.
- **7-day free trial** of the full paid tier.
- **Considering:** founding-member discount for early subscribers; a premium tier (~$24.99–29.99/mo) when live voice calls arrive in phase 2.
- **Unit economics (to verify in prototype):** app stores take 15% (small-developer rate), so $14.99 nets ~$12.75; expected AI cost ~$1–3 per active user per month.
- **Market reference (2026):** AI journals/wellness apps $8–15/mo (Reflection, Finch, Rosebud, Headspace, Mindsera, Calm); Noom ~$59–70/mo.
- **Routine check-ins use a cheap model** for every tier; deeper conversations (onboarding, weekly review, "why didn't I?" digs) can use a stronger model.

## Decisions log

- 2026-11-23 — Launch coaches: Body, Time & attention, Relationships.
- 2026-11-23 — Relationships uses the habits-not-counseling model (resolves David/Ethan debate).
- 2026-11-23 — Free = 2 areas on a cheaper model; paid = all areas. Cheap model for routine check-ins. _(Superseded below: free = 1 area.)_
- 2026-11-23 — User controls check-in frequency.
- 2026-11-23 — Check-in/reminder design, device-calendar reminders, security approach, vision picture and day-one value principle adopted.
- 2026-11-23 — Agentic meta coach planned for phase 2, with phase 1 built on the same loop.
- 2026-11-23 — MVP interview is adaptive with turn-based voice answers (no video). Live voice and coach calls are phase 2.

- 2026-11-23 — Pricing: free = 1 area; paid = $14.99/month or $99/year, all areas.
- 2026-11-25 — In-app mic button (transcribed on the server) and a Week tab with this week's plan (calendar strip + list), filled by the weekly review / "plan my week" with the coach.
- 2026-11-24 — Technology: Postgres/pgvector foundation; dspy.ts for coach quality; AgentDB/RuVector piloted as swappable memory; Ruflo for dev only; MidStream evaluated in phase 2.
- 2026-11-25 — Prototype coach temporarily runs on a free Gemini key (Google AI Studio); Claude when a Claude key is set. Free tier: test with made-up details only.
- 2026-11-25 — "Not just a chatbot" principle, visual life map onboarding (assess all areas, coach a few) and evidence-based area playbooks adopted (David's prototype feedback).

## Open decisions

- None right now.

## Next steps

1. Agree on this spec (resolve open decisions).
2. Prototype the coach: write the coach's instructions; David and Ethan use it daily for two weeks before building the app.
3. Have practising coaches review each area playbook.
4. Build the MVP app: Expo (React Native) mobile app + backend for accounts, data and AI calls (API keys stay on the server).

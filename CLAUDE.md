# Eudaimonia

A mobile AI life-coach app that helps people define and build lives of eudaimonia. Built by David and Ethan.

Product spec: [docs/product-spec.md](docs/product-spec.md) — read it before product or coaching work.

## Status

- Prototype app built: Expo (React Native, SDK 58, Expo Router). The AI is called only from the server route `src/app/api/coach+api.ts` → `src/server/coach.ts` (API key in `.env`, never in app code). For now it uses a free Gemini key (`src/server/gemini.ts`); Claude is used when only `ANTHROPIC_API_KEY` is set. Data is on-device (AsyncStorage). How to run: [docs/running-the-app.md](docs/running-the-app.md).
- Before writing Expo code, follow [AGENTS.md](AGENTS.md) (check versioned Expo docs; use `npx expo install`).
- Tests: `npx tsx tests/profile.test.ts`, `npx tsx tests/life-map.test.ts`, `npx tsx tests/week.test.ts` and `npx tsx tests/influences.test.ts`. Typecheck: `npx tsc --noEmit`. Lint: `npx expo lint`.
- Coach prototype: instructions in [src/coach/coach-instructions.md](src/coach/coach-instructions.md), two-week test plan in [docs/prototype-guide.md](docs/prototype-guide.md). Keep the instructions and area playbooks (`src/coach/playbooks/`) in sync with the spec's coaching rules (scope, safety, tone) and its Area playbooks table.

## Conventions

- Source in `/src`, tests in `/tests`, docs in `/docs`, config in `/config`, scripts in `/scripts`.
- Never commit secrets or `.env` files.
- Run tests after code changes; make sure the build passes before committing.

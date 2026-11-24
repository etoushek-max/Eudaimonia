# Eudaimonia

A mobile AI life-coach app that helps people define and build lives of eudaimonia. Built by David and Ethan.

Product spec: [docs/product-spec.md](docs/product-spec.md) — read it before product or coaching work.

## Status

- Mobile app; planned stack is Expo (React Native) + a backend for accounts, data and AI calls.
- Spec drafted; no app code yet.
- Coach prototype: instructions in [src/coach/coach-instructions.md](src/coach/coach-instructions.md), two-week test plan in [docs/prototype-guide.md](docs/prototype-guide.md). Keep the instructions in sync with the spec's coaching rules (scope, safety, tone).

## Conventions

- Source in `/src`, tests in `/tests`, docs in `/docs`, config in `/config`, scripts in `/scripts`.
- Never commit secrets or `.env` files.
- Run tests after code changes; make sure the build passes before committing.

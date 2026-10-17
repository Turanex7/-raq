# Audit

## Scope and current stack

- Repository root: `Cultech/`.
- Frontend: React 19 + Vite 8 + React Router 7; `frontend/package.json` has no API client or server dependency.
- Existing demo state is held in module memory in `frontend/src/features/gamification/gameStore.js` and is reset on refresh.
- No `backend/`, database, migrations, API contract, `.env.example`, or frontend service layer existed at audit time. `README.md` describes an intended ASP.NET Core/PostgreSQL backend but explicitly says it has not yet been created.
- No repository `AGENTS.md` files were found.

## Baseline run results

- `npm test`: passed, 4 tests.
- `npm run lint`: passed.
- `npm run build`: passed. Vite warns that the 3D `Sparkles` chunk is 931 kB minified and the hero image is 2.66 MB.
- `npm run dev -- --host 127.0.0.1`: failed before serving with `listen EPERM: operation not permitted 127.0.0.1:5173`; this environment denies local port binding.
- `dotnet --info`: .NET SDK 9.0.305 is installed. The expected `backend/Chiraq.Api` project is absent, so there was no backend to launch or test.

## Findings before implementation

### Data and game logic

- `frontend/src/features/gamification/gameStore.js` seeded 40 users from only five repeated names, used high synthetic weekly XP, and reset all progress on refresh.
- XP, rankings, prizes, check-ins, QR and group/co-op behavior were calculated or simulated in the browser; the client could award its own XP.
- There was no first-visit metric, immutable XP ledger, persistence, authentication, or server-side duplicate-completion protection.
- `frontend/src/features/gamification/gameConfig.js` applied prior-week multipliers to total XP; config needed an explicit +10% cap and base-XP-only application.

### API and security

- There were no frontend API calls, backend routes, request validation, CORS policy, rate limits, structured request logs, auth tokens, QR signature validation, or anti-cheat flags.
- GPS and camera were only demo inputs. No persisted check-in model or location minimization policy existed.
- No season finalization snapshots, territory ownership, group sessions, or prize eligibility verification existed.

### UI and routing

- `/map` was a stylized weekly pin grid even though the separate `/places` page had Leaflet.
- Museum detail pages offered generic text and lacked server-backed owner gap, actionable task completion, and route planning.
- The standalone scanner lacked manual code entry; QR completion and camera fallback were local simulation.
- Leaderboard, reward, collection and account states were mock data. Open league and group creation were absent.
- Main navigation did not reliably mark nested detail routes active; browser title was the Vite default.
- Some user-facing rarity labels and souvenir art were emoji/English; mock museum availability and pin counts had separate sources.
- The 3D scene and map tiles require network access; there was no API/offline empty-state integration.

## Frontend/backend contract mismatch

No contract or calls existed, so there were no mismatched requests to enumerate. Existing frontend routes were entirely local and did not correspond to backend endpoints.

## Implementation direction

The repository's planned backend stack is ASP.NET Core, and .NET 9 is installed. The backend will be created in that stack with a portable SQLite development database and an EF Core migration if package restore is available; if dependency restore is blocked, that limitation and the chosen fallback will be documented rather than leaving a non-running app.

## Verification limitations

Local browser preview could not be opened because the sandbox denied the Vite listener. Static checks and build are available; an end-to-end browser walkthrough requires an environment that permits local port binding and camera/geolocation access.

## Implemented after the baseline audit

- Added `backend/Chiraq.Api`: ASP.NET Core 9, EF Core 9 SQLite migrations, server-side password hashing/JWT, HMAC QR signatures, CORS, auth/check-in/completion rate limits, structured request logs, consistent JSON errors, and a background season rollover service.
- Added a seeded model with 8 universities, 10 Baku museum/outdoor places, 40 distinct Azerbaijani demo names, avatars, limited souvenirs and 5 task types per place. XP totals come from task completion/ledger rows.
- Added auth/profile, places/current season, task/check-in, leaderboards/fair university scores, territory, groups, co-op, collection, rewards/claim, share-card, admin metrics/demo, and QR sheet routes. See `docs/api-contract.md`.
- Added one API client and API-backed map, place/task, QR, leaderboard, profile, collection, rewards, and onboarding screens. The logo is a `/` link and has a mint keyboard focus indicator. Main app pages use responsive layouts and a mobile bottom navigation; the Leaflet map invalidates its size after layout changes and falls back to a location list when tiles fail.
- Added `NOTES.md` with demo assumptions, known risks, and unfinished P1/P2 work.

## Final verification on 2026-10-17

- `frontend`: `npm test` passed (4/4), `npm run lint` passed, and `npm run build` passed. Build prints the existing large 3D Sparkles chunk warning and includes a 2.66 MB hero image asset.
- Backend: `dotnet test backend/Chiraq.Api.Tests/Chiraq.Api.Tests.csproj` passed (13 tests after final rule additions); `dotnet build backend/Chiraq.Api/Chiraq.Api.csproj` passed with 0 warnings/errors.
- Started the API against a fresh database; EF applied `20261017135233_InitialCreate` and seeded the database. `/api/health`, `/api/places` (10 rows), and `/api/seasons/current` returned successfully.
- Live API smoke flow passed: register -> places -> signed demo QR -> task completion (+20 first-visit XP and souvenir) -> duplicate completion rejected -> share-card data.
- Sandbox local socket restrictions prevent ordinary test/server binding; those checks passed with local network permission. A mobile-size browser check covered the landing page and core routes without horizontal overflow; the logo link from `/leaderboard` returned to `/` and the title changed to “Ana səhifə · Çıraq”. Browser viewport controls reported a slightly wider effective CSS viewport than requested. A real phone camera/GPS walkthrough still needs hands-on device confirmation.

# HEPHAESTUS / The Divine Atelier

A cinematic Greek mythology portfolio experience by **JBX Web Studio**. Enter the workshop of Hephaestus, explore three imagined relics, and forge an original digital object from an intention, material, and maker's mark.

**Live:** https://hephaestus-atelier.vercel.app · **Repository:** https://github.com/JBXWebsites/hephaestus-atelier

## Run locally

Requires Node.js 22 or 24.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. There are no API keys, environment secrets, database provisioning steps, or paid services required by the application.

```sh
npm run typecheck
npm test
npm run build
npm start
npm run test:e2e
```

Browser tests expect the production server on port 3000 and installed Google Chrome. See `playwright.config.ts` to adjust browser settings. `scripts/capture.mjs` records desktop and mobile scene screenshots against the local server.

## The experience

- Original imagery: imagined stone Hephaestus, volcanic workshop, and three relic studies.
- Six-scene exhibition-to-workbench story with GSAP entrance, parallax, typographic choreography and optional desktop ScrollSmoother.
- Real Three.js object geometry: Aegis / Protect, Pyr / Begin, Nostos / Return.
- Bronze, Obsidian and Silver finishes; Sun, Wave and Laurel marks, yielding 27 combinations.
- Drag and keyboard rotation, reduced motion, WebGL fallback, no idle render loop.
- Server-created portable relic records, independent share pages, downloadable archival SVG prints.
- A collection of twelve recent relics stored on the visitor's device, with removal controls.

## Backend and privacy

`POST /api/relics` validates three enum choices and creates a versioned record. A 38-character base64url token contains the choices, creation timestamp, random nonce, and corruption checksum. `GET /api/relics/[token]` reconstructs the same record. `GET /api/relics/[token]/print` generates a 1200×1600 SVG illustration. `/relic/[token]` presents the saved object.

The share URL is the portable record. There is deliberately no remote collection database, account, free-text field, payment, or manufacturing service. The checksum detects accidental corruption; it is **not an authentication signature**. Records are fictional digital keepsakes, not certificates of ownership, NFTs, or scarce goods. Anyone with a link can view it. Hosting may process ordinary request logs.

Body size, content type, origin, fields, enum values, timestamps, encoding and record length are validated. SVG output is escaped and served as an attachment with restrictive headers. Client failures preserve choices and allow retry. New gallery choices cancel obsolete submissions.

## Structure

- `app/`: routes, metadata, API handlers and responsive design tokens.
- `components/Experience.tsx`: page story, gallery, navigation, GSAP setup and local collection.
- `components/Forge.tsx`: configuration, request lifecycle and result state.
- `components/RelicScene.tsx`: authored geometry, material lighting, demand rendering and fallback.
- `lib/relics.ts`: shared catalog and types.
- `lib/server-relics.ts`: versioned recipe encoding, validation and print renderer.
- `docs/BLUEPRINT.md`: detailed intent, section rationale, states, motion, responsive and implementation specification.
- `docs/IDEATION.md`: 30-concept exploration and selection.
- `docs/PLAN-REVIEW.md`, `docs/IMPLEMENTATION-REVIEW.md`: independent reviews, with original findings retained for traceability.
- `docs/RELEASE-AUDIT.md`: final evidence, fixes and limitations.
- `public/images/`: optimized original generated artworks.
- `public/fonts/`: self-hosted fonts and license texts.

## Art and attribution

The site is an original fictional atelier, not an archaeological reconstruction. Generated images establish the imagined world; the configurable 3D objects and illustrated prints are distinct authored interpretations. Asset direction and source filenames are recorded in `docs/ASSETS.md`. Fonts: Marcellus and Manrope, SIL Open Font License. Historical source collection: [Theoi / Hephaestus](https://www.theoi.com/Olympios/Hephaistos.html). No source text was copied into the experience.

## Deployment

Deploy as a Next.js project on Vercel with `npm run build`. Production deployment and Git integration are documented in `docs/RELEASE-AUDIT.md`. Main-branch updates build through the GitHub connection. No environment values are needed for application functionality. `metadataBase` uses the Vercel production URL when available.

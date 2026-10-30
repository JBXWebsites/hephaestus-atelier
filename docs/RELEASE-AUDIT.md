# HEPHAESTUS / Release audit

Release prepared 2026-10-29 for JBX Web Studio. This records evidence and limits, rather than a claim of design perfection or an award.

## Outcome and design decisions

The selected concept is a fictional divine atelier: enter Hephaestus's world, understand the maker, explore three objects of intention, then become the maker yourself. Thirty concepts were explored across three delegated branches. The detailed rationale, specification and two independent review rounds live in IDEATION.md, BLUEPRINT.md, PLAN-REVIEW.md and IMPLEMENTATION-REVIEW.md.

The six scenes share limestone, soot-green, aged metal and ember light. Marcellus supplies the monumental voice; Manrope carries controls and reading text. Five original generated artworks establish the world. Live Three.js geometry and vector prints are disclosed as authored interpretations of those artistic studies. The workbench is the functional climax, not a decorative widget.

All animated page and object transitions use GSAP. ScrollSmoother is limited to desktop fine-pointer browsing. Mobile uses normal document scrolling; both OS reduced motion and the visible motion control are respected. Objects render on demand and stop drawing when idle, offscreen or hidden. No audio, autoplay video, cursor replacement or mandatory cinematic preloader delays the task.

The desktop experience is approximately 6.5 viewport heights at 1440×1000, shorter than the provisional 8–10 estimate. Rendered spacing and a direct route to the forge were more useful than padding the journey to an arbitrary duration. Every section has a distinct narrative or functional job.

## Completed verification

| Area | Evidence |
|---|---|
| Production build and types | Next.js production build and strict TypeScript check pass. |
| Backend | 11 tests pass, covering all 27 create/read/print combinations, exact schema, invalid bodies, streamed size cap, public-origin handling, encoding, timestamps, tampering and XML safety. |
| Complete browser journey | Six Playwright tests pass: gallery selection, configuration, creation, separate-browser record reopening, SVG download, local collection removal, failed request/retry, stale-response cancellation, 390/320px keyboard and overflow checks, invalid-record recovery. |
| Independent flow review | Normal-motion desktop/tablet/phone anchors, repeated gallery choice, keyboard copy focus, storage denied, JavaScript disabled, delayed submission, heading/landmark checks. See implementation-review appendix. |
| Visual coverage | 1440 and 390px scene screenshots; independently inspected 1920 and 768px hero/workbench; 320px layout checks. All 27 live object variants inspected in artifacts/relic-matrix.png. |
| Renderer resilience | No idle/offscreen drawing; finite normal-motion transitions; reduced-motion changes render once; forced WebGL context loss produces recipe-specific illustration and disables rotation controls. See artifacts/relic-viewer-audit.json. |
| Assets | Self-hosted fonts with licenses, local optimized images, dedicated portrait mobile hero. No remote image or HDR dependency. |

## Audit findings resolved

- Browser submissions use the public Host with platform-scoped protocol handling, avoiding comparison with an internal listening address. Unrelated origins still fail.
- New gallery selections abort obsolete requests and prevent stale recipes from becoming the visible result. An explicit selection revision also applies a repeated gallery choice.
- Result focus/entrance occurs for a newly created result, not for copy feedback. Keyboard copy retains its control focus.
- Brand links derive their accessible names from visible text; Reset view includes its exact visible phrase. Maker footnote contrast was strengthened. Text reveal effects retain full contrast and accessibility-tree presence.
- Narrow closing typography no longer overflows. Solid-header state survives React updates. ScrollSmoother does not recenter section focus after explicit anchor navigation.
- No-JavaScript phones have useful navigation and static descriptions of all three studies. Shared records have an archival-image fallback and ordinary download link.
- Material lighting, aged bronze and marks were refined through the 27-variant visual review.

## Hosting

- GitHub: https://github.com/JBXWebsites/hephaestus-atelier
- Vercel project: hephaestus-atelier, linked to that repository's main branch, Node.js 24, public deployment protection setting, automatic Git deployments enabled.
- Public URL and final production measurement will be recorded after the initial deployment is verified.

## Scope and practical limits

Records are real server-generated portable recipes, with independent pages and downloadable SVGs. The link contains the recipe; no database, account, payment, external AI service, credentials or personally identifiable submission is needed. The local collection is explicitly device-local. The checksum detects corruption and does not establish authenticity or ownership.

Automated browser testing uses installed desktop Chrome with emulated viewports. It is not a physical iPhone/Android device study, a full assistive-technology certification, field Core Web Vitals, or research with prospective clients. An Awwwards outcome cannot be guaranteed. Further changes should be driven by observed use or a new brief rather than an assertion that no possible improvement remains.

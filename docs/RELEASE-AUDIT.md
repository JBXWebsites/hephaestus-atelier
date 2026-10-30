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
- Final readability pass raises all small captions and controls to an 11px minimum. At 320px the secondary wordmark subtitle is omitted to keep navigation clear. The updated six-test browser suite and desktop/mobile scene sweep pass.

## Hosting

- GitHub: https://github.com/JBXWebsites/hephaestus-atelier
- Vercel project: hephaestus-atelier, linked to that repository's main branch, Node.js 24, public deployment protection setting, automatic Git deployments enabled.
- Public URL: https://hephaestus-atelier.vercel.app
- Initial Git push `47c7436` automatically created production deployment `dpl_Aoz9RXJLykkNQVikEv44BT8ajd26`, which reached READY. GitHub reports a successful Vercel status. No authentication is needed to use the public alias.
- All six browser tests passed again against the public alias, including actual server creation, a fresh browser's shared record and SVG download. The independent public review found zero axe violations on home, credits and a newly created record, and verified normal-motion navigation and keyboard copy.

## Performance measurement

Lighthouse 13.6.0, Chrome headless, standard simulated mobile settings, public production alias. Scores: **performance 97, accessibility 100, best practices 100, SEO 100**. First contentful paint 0.9s, largest contentful paint 2.6s, total blocking time 20ms, cumulative layout shift 0, speed index 1.4s. Local baseline was 93/100/100/100 with 3.2s LCP.

These are individual lab runs, not field guarantees. Production LCP is slightly above the blueprint's aspirational 2.5s target. Remaining audit opportunities concern approximately 20KiB unused JavaScript, 14KiB legacy compatibility code and 17KiB image savings; they are documented rather than claiming every possible optimization is complete. Core content, controls and measured layout stability are sound. A final caption readability adjustment follows this measurement; it does not change the media or runtime architecture.

## Scope and practical limits

Records are real server-generated portable recipes, with independent pages and downloadable SVGs. The link contains the recipe; no database, account, payment, external AI service, credentials or personally identifiable submission is needed. The local collection is explicitly device-local. The checksum detects corruption and does not establish authenticity or ownership.

Automated browser testing uses installed desktop Chrome with emulated viewports. It is not a physical iPhone/Android device study, a full assistive-technology certification, field Core Web Vitals, or research with prospective clients. An Awwwards outcome cannot be guaranteed. Further changes should be driven by observed use or a new brief rather than an assertion that no possible improvement remains.

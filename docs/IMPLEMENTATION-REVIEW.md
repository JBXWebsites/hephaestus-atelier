# HEPHAESTUS / Independent implementation review

Reviewed the initial implementation against `docs/BLUEPRINT.md`, `PRODUCT.md`, and `DESIGN.md` on 2026-10-29. Code references below identify the reviewed snapshot; later fixes may move these lines. No implementation or test files were changed during this audit.

## Evidence and scope

- Read `Experience.tsx`, `Forge.tsx`, `RelicScene.tsx`, `RelicRecordView.tsx`, global styles, shared recipe/server modules, home/record/credits/layout routes, and all three API routes.
- Used headless installed Chrome through Playwright against the production server at `http://localhost:3000`, with 1440 × 1000 desktop viewports and a 390 × 844 JavaScript-disabled viewport.
- Exercised the direct forge anchor, fresh `/#forge` navigation, gallery → forge reuse, all 27 combinations of UI choices, ordinary submission, a controlled delayed-success response, copy feedback, and a full-page axe scan.
- The delayed-response check used an authentic server-created Aegis record supplied after a controlled delay, to isolate state behavior from the real origin-check failure. It is not a claim that normal browser submission succeeded.
- The 27-state check verified matching material/mark accessible descriptions and UI changes. It did not visually certify all 27 renders or prints, mobile WebGL behavior, actual-device performance, or production hosting behavior.

## Actionable findings

### P1 — Normal browser submissions fail the origin check on the local production server

**References:** `app/api/relics/route.ts:10`, `app/api/relics/route.ts:11`; secondary error-handling issue at `components/Forge.tsx:28` and `components/Forge.tsx:32`.

**Observed:** from `http://localhost:3000`, an actual click on “Forge my relic” sent a POST and received HTTP 400 with `Open the atelier on this site before forging a relic.` The server was started with its configured `0.0.0.0` binding. The implementation compares browser Origin directly with `new URL(request.url).origin`, which need not represent the public browser address in this deployment setup. The UI then replaced this actionable rejection with the inaccurate message “The connection to the forge was interrupted.”

**Impact:** the primary journey cannot complete in the reviewed browser/server configuration. This is a release blocker until a normal browser POST succeeds on both local and deployed addresses.

**Fix:** derive the permitted public origin using the actual hosting/request contract, handling trusted proxy metadata deliberately rather than comparing against an internal bind address. Keep genuine cross-origin requests rejected. Preserve safe server validation messages for known HTTP errors; reserve connection-interrupted copy for transport failures.

**Verify:** real browser submission from the local hostname and production alias returns 201; an unrelated Origin still fails; error copy identifies the actual failure class.

### P1 — A gallery selection during submission can label one relic while linking to another

**References:** `components/Experience.tsx:74`, `components/Forge.tsx:17`, `components/Forge.tsx:27`, `components/Forge.tsx:29`, `components/Forge.tsx:50`.

**Observed:** start forging Protect/Bronze/Sun, move to the gallery while the response is delayed, choose Pyr, and click “Make this your own.” The gallery can update the parent intention even though the workbench's fieldsets are disabled. The incoming Aegis response is subsequently assigned without checking whether its submitted choices still match the active choices. The resulting UI showed `Pyr · Bronze · Sun` and `Pyr, made yours.` while the actual result record contained `intention: protect`.

**Impact:** the visitor can download or share a different object from the one presented as finished. This violates the central reproducibility promise.

**Fix:** snapshot submitted choices and associate the response with that snapshot. Either prevent every upstream selection mutation while pending, or invalidate/abort the active request when any selection changes and ignore stale responses. Render result identity from `result.recipe`, not mutable current choices.

**Verify:** delay a submission, change the gallery selection, and confirm either the transition is blocked or no stale result becomes active. The preview, title, share page, and print must agree.

### P2 — Re-selecting an already selected gallery intention does not restore it in the forge

**References:** `components/Experience.tsx:21`, `components/Experience.tsx:74`, `components/Experience.tsx:77`, `components/Forge.tsx:15`, `components/Forge.tsx:17`, `components/Forge.tsx:22`.

**Observed:** on a fresh page the gallery and parent intention are Aegis/Protect. Change the workbench to Begin, return to the gallery without changing its selected Aegis study, then click “Make this your own.” The workbench still reads `Pyr · Bronze · Sun`. The parent sets `protect` to its existing value, so the child's intention effect does not run.

**Impact:** a prominent gallery action fails to configure the object it advertises.

**Fix:** use one shared source of truth for the selected intention, or pass an explicit selection event/revision that is applied even when the selected value repeats. Preserve material and mark when applying the gallery intention. Reset stale result/error/copy states consistently when a new selection is applied.

**Verify:** repeat each gallery choice after manually selecting each of the other workbench intentions; all nine transitions must select the gallery's intention.

### P2 — Result focus and celebration rerun after unrelated state changes

**References:** `components/Forge.tsx:20`, `components/Forge.tsx:21`, `components/Forge.tsx:35`.

**Observed:** after a successful controlled response, click “Copy link.” Focus moves off the copy button onto `DIV.forge-result`. `celebrate` is newly wrapped on every render and appears in the result effect's dependency list, so changing copy feedback reruns the focus/celebration effect while the result is unchanged.

**Impact:** keyboard position is unexpectedly reset, and normal-motion visitors can see the finished result replay its entrance on copy or other rerenders. This conflicts with the blueprint's one-time success sequence.

**Fix:** key the success effect to a newly created result token, with stable callback handling. Announce copy status without moving focus. A motion preference change should update motion behavior without refocusing the result.

**Verify:** after creation, copy with the keyboard and confirm focus remains on the button, feedback is announced, and the result entrance does not replay.

### P2 — Accessible names do not contain their visible labels

**References:** `components/Experience.tsx:60`, `components/RelicScene.tsx:625`.

**Observed:** axe reported `label-content-name-mismatch` for `.brand` and the reset button. The brand's visible text includes “HEPHAESTUS / THE DIVINE ATELIER” while its aria-label is “Hephaestus home.” “Reset view” is visibly presented while the accessible name is “Reset relic view,” which breaks the contiguous visible phrase.

**Impact:** speech-input users cannot reliably activate controls using the words displayed on screen.

**Fix:** include the complete visible label in the accessible name, or let visible text supply the name. For the reset button, “Reset view of relic” preserves the visible phrase. Recheck both the main and simplified headers for the same naming pattern.

**Verify:** rerun the label-in-name check and inspect the accessibility names manually.

### P2 — Maker footnote narrowly fails normal-text contrast

**Reference:** `app/globals.css:5`, selector `.maker-footnote span`.

**Observed:** axe measured foreground `#58624f` against rendered background `#d7d9cb` at 4.48:1. The text is 9px, so it requires 4.5:1 rather than the large-text threshold.

**Fix:** darken the footnote color with a practical margin above the threshold and consider increasing this already small reading size. Verify against the actual OKLCH-rendered background.

**Verify:** the same desktop scan passes contrast; spot-check at tablet and mobile sizes where font sizes differ.

## Direct-anchor workflow observations

**References:** `components/Experience.tsx:28`, `components/Experience.tsx:49`, `components/Experience.tsx:51`, `app/globals.css:3`.

Fresh loading of `/#forge` worked in the measured desktop case: forge section top was about 89.5px and its heading top about 264.5px. Clicking the fixed desktop header's forge link through ScrollSmoother produced a different landing: forge section top about −88.5px, heading top about 86.5px, header bottom 80px. The primary heading remained visible, but the section's identifying line was hidden and almost all intended breathing room was lost. Review the smoother position argument and final scroll position after lazy scene layout changes; do not describe this observed difference as a total navigation failure.

The gallery reuse and pending-response findings above are the higher-impact anchor-workflow defects. Verify header, gallery, footer, record “Create another,” initial hash, browser back/forward, and reduced-motion anchors as complete selection/navigation flows. Native Playwright auto-scroll had difficulty reaching a distant gallery element while smoothing was enabled; subsequent deterministic state checks used reduced motion. That automation difficulty alone is not presented as a user-facing defect.

## No-JavaScript observation

**References:** `components/Experience.tsx:60`, `components/Experience.tsx:74`, `components/Forge.tsx:53`, `app/globals.css:14`.

The story remains available, the page has no measured horizontal overflow at 390px, and the forge correctly discloses that it needs JavaScript. However, the disclosure says visitors can explore “its three relic studies” while the gallery renders only the initially selected study; the selection buttons cannot reveal the other two without JavaScript. The phone header also shows an inoperative Menu button and hides its direct forge link. These are scope/copy and fallback gaps, not equivalent to the primary submission blocker. Show a simple no-script navigation and static studies, or accurately limit the fallback promise to the visible atelier content.

The record route includes a no-script archival image plus ordinary download link, which is a useful fallback. This audit did not independently verify the browser's rendering of that attachment endpoint as an image.

## What already aligns with the plan

- Form, material, and mark are exposed as labeled native buttons in fieldsets; selected states use `aria-pressed`, and rotation has keyboard-operable alternatives.
- All 27 UI combinations produced the expected material and mark in the live stage's accessible description. This is state coverage, not complete visual approval.
- Reduced-motion paths bypass page motion, and the scene checks the OS preference independently. The scene also responds to preference changes.
- The renderer caps DPR, initializes near the viewport, stops idle drawing, observes page/viewport visibility, disposes resources, and supplies illustrated fallback on initialization/context failure. These address the earlier plan review's major rendering concerns.
- Server input validation rejects extra or invalid choices, checks body size while streaming, enforces canonical token encoding/version/timestamp bounds, and returns consistent missing-record behavior. The print escapes XML and has attachment/nosniff/content-security headers.
- Credits accurately distinguish a portable recipe from authenticity, ownership, a database, and physical manufacture. The checksum is explicitly documented as corruption detection rather than a signature.
- Image stages reserve layout space and declare responsive sizes; the hero is prioritized while later content and the live scene are deferred. No measured Core Web Vitals claim is made here.

## Release recommendation

Resolve normal-origin submission and the two gallery/forge state issues before release. Then recheck one uninterrupted browser journey from gallery selection through creation, copied share URL, fresh record page, and download, including a delayed-response attempt. Fix the repeat-focus and two measured accessibility findings. Complete the remaining 27-variation visual contact sheet and mobile normal-motion anchor checks; API or accessible-label enumeration alone does not establish visual consistency across the collection, live scene, and archival print.

## Rebuilt production verification appendix

Verified the subsequent local production build on 2026-10-30 UTC using installed Chrome. This supersedes the initial findings where explicitly verified below; it is not production-host verification.

- **Core journey and state:** an ordinary browser submission now succeeds. Reusing gallery Aegis after selecting Begin restores Aegis. A delayed response arriving after a gallery switch is ignored, leaves no stale result or error, and a fresh submission correctly creates the newly selected Pyr record.
- **Normal-motion navigation:** header and gallery links land at approximately 84px / 75px / 75px from the top at 1920 × 1080, 768 × 1024, and 390 × 844. An initial desktop test discrepancy was caused by Playwright's automatic scrolling inside the smoother; a real wheel-and-click reproduction landed correctly. It is not an outstanding application finding.
- **Keyboard and resilience:** activating Copy link with Enter preserves focus on the button and leaves the result fully visible with an identity transform, without replaying its entrance. Denying both storage reads and writes still creates a usable relic and displays the explicit keep-link notice.
- **No JavaScript:** at 390px the inert menu is hidden, the direct forge link is visible, supplemental Pyr/Nostos descriptions accompany the initial Aegis study, and no horizontal overflow was measured. A record's no-script archival image loaded successfully at its 1200px natural width and fit its 350px display area.
- **Visual inspection:** captured and inspected hero and forge viewports at 1920px and 768px. Typography, sculpture crops, workbench structure, and tablet stacking remained coherent without observed layout overflow. These captures do not certify all 27 visual variations.
- **Semantics and axe:** home, credits, and a newly created record each contain one H1 and one main landmark. The previously flagged footnote contrast and reset-button name pass. The only axe finding remaining in the served build is the brand link's label-in-name mismatch on all three routes.

**Residual action before release:** rebuild and rerun the three-route axe scan after the already prepared source fixes removing brand aria-label overrides and reveal opacity. Those two source changes were not present in the build checked here. The newly prepared dedicated mobile hero crop also postdates these captures; verify its rendered mobile framing after rebuilding. No further actionable defect was reproduced in the completed checks.

## Final public verification

Verified `https://hephaestus-atelier.vercel.app` on 2026-10-30 UTC in installed Chrome with normal motion enabled. The pending checks above are now resolved:

- Full-page axe scans returned **zero violations** on the homepage, credits page, and a newly created Nostos record. Each route has one H1 and one main landmark; the previous brand-label and contrast findings no longer appear.
- At 1440 × 1000, ordinary header navigation followed by real wheel scrolling and the gallery CTA selected Nostos and landed the forge at approximately **83.5px** from the top.
- Clicking the actual forge button returned **HTTP 201** and produced the Nostos record. Keyboard activation of Copy link retained focus on “Link copied”; the result remained at opacity 1 with an identity transform, with no entrance replay.
- Captured and visually inspected the public hero at **390 × 844**. The browser selected `/images/hero-mobile.webp` at its natural **560 × 1024** size. The sculpture, headline, supporting copy, CTA, and footer cue fit the viewport without measured horizontal overflow or observed clipping.

**Residual actionable findings from this final pass: none.** Automated accessibility checks supplement the manual interaction and visual checks above; this is not a claim of complete accessibility certification or actual-device coverage.

# HEPHAESTUS / Execution blueprint

## 1. Brief and scope
Self-authored, not interviewed. User delegated subject selection, planning and execution. Deliver a standalone portfolio experience for JBX Web Studio, a new GitHub repository and a connected Vercel production deployment. This is a complete fictional interactive atelier, not the studio's main commercial homepage. No sale, booking or email capture is implied. Build complete real functionality for the chosen product: browse relics, configure one, generate its record, reopen/share and download it.

### Eight creative decisions
1. Vibe: monumental, tactile, mysterious, deliberate. Physical references: sculpture conservation lighting, volcanic stone, a museum foundry.
2. Journey: encounter the maker; understand what he makes; inspect three possibilities; make choices; leave with a relic.
3. Energy: imposing first frame, quieter origin, material curiosity, brief typographic tension, participatory climax, calm ownership.
4. Emotion: awe → intimacy → curiosity → anticipation → agency → satisfaction.
5. Signature: an open orbit closes around an inscribed core when the visitor forges their object. Intention changes its silhouette, material changes its finish, and mark changes its engraved face.
6. Range: cinematic sculptural luxury with precise exhibition typography, not minimal corporate or game interface.
7. Distinct scenes, with coherent light/material direction and purposeful cuts. A named custom grammar: the exhibition-to-workbench journey. No compulsory one-shot or forced scroll.
8. Available assets: design-reference PDF only. Generate original atmospheric assets; self-host fonts; author actual geometry.

### Central message and memory
Extraordinary things are made with intention. Tell-someone sentence: "It's the site where you enter a god's workshop and leave with an object you forged." The peak is the forge's assembly and final seal, not a gratuitous effect in the introduction. No blank scroll is intentional.

## 2. Concept decision and critique
ADHD exploration covered game design, inversion, curious child, biology and extreme constraints, with three concurrently active isolated branches under the runtime's three-worker limit. Thirty ideas were generated. The top three received independent deepening: divine forge, restoration atelier, constellation repair. Scoring weights: novelty .35, viability .40, fit .25. Full exploration is recorded in IDEATION.md.

Chosen: Hephaestus's atelier. It combines culturally relevant authorship, a compact and comprehensible configurator, excellent material imagery and a credible backend. Restoration was strong but depends on matched before/after asset continuity. Star repair has agency but risks precision-game frustration and a familiar dark-blue constellation aesthetic.

### Plan audit, pass 1
- Original concept risk: arbitrary form controls dressed as mythology. Resolve with three explicit intentions and authored inscriptions; every choice changes the record and visual output.
- Original concept risk: fake manufacturing. Explicitly call this a fictional digital atelier and digital relic. No checkout, price or fabricated inventory.
- Original concept risk: backend requires accounts, external storage or private information without a user need. Resolve using a versioned self-contained recipe in the share URL, validated and rendered by the server. Local collection is explicitly saved on this device. No secret, database, paid service or PII needed.
- Original concept risk: hero more compelling than workbench. Budget custom 3D, distinct silhouettes, material lighting and success choreography for the forge itself.
- Original concept risk: scroll traps. Never require scrolling to access the forge; persistent direct link and normal anchor fallback. Mobile has no pinning requirement.

### Plan audit, pass 2
- Remove custom cursor; preserve familiar affordances and avoid competing motion.
- Remove audio by default; it adds no necessary information.
- Remove free-text inscriptions; curated marks and authored intent text avoid privacy, injection and moderation overhead.
- Reject a simple shader-color toggle as the whole interaction. Form must change geometry, material must change reflectance/roughness/color, symbol must change visible engraving.
- Keep portrait imagery separate from live object so illustrative asset differences are honest. Download is an archival illustrated print of the same recipe, explicitly distinct from a photograph.
- Stopping criterion: no known critical/high usability defects; coherent inspected desktop/mobile intermediate frames; complete core task and failure recovery; verified repository and production build. "Cannot improve any longer" is not objectively provable; continue concrete audit/fix cycles rather than making that claim.

## 3. Page map and exact content responsibilities
### Global frame
Header: custom H forge emblem + HEPHAESTUS wordmark left. The Atelier / The Collection anchor links center on desktop. "Enter the forge ↗" right. Mobile uses wordmark, forge link and accessible menu disclosure. Sticky dark header after hero; no opaque overlap with important copy. Skip link precedes nav. Footer carries Credits & mythology, My collection and "An independent experiment by JBX Web Studio".

### Scene I: the threshold (1.05 viewport)
Job: orient within five seconds, establish mythical artisan and invite exploration. Full-width dark image stage. Hero eyebrow "THE DIVINE ATELIER" once only. H1 "FORGED / FOR THE / ETERNAL." set left at roughly 10vw, three lines, max 8 characters per line. Supporting text: "A workshop beyond Olympus. Objects shaped by myth, made meaningful by you." Primary "Enter the forge" anchors directly to workbench. Bottom caption identifies "Hephaestus / God of fire & craft"; opposite a restrained downward cue "Discover the atelier". Right-side sculpture face must remain intact. Image is loaded eagerly with responsive width and preload. All important text is HTML.
Motion: entrance reveals headline lines, image settles at scale 1.04→1. Hero parallax only while visible; translation ≤8% of height. No blocking preloader.
Mobile: portrait crop right/center, text layered in protected lower/left area, font minimum 52px; header compact; supporting line below heading. At 320px use 48px if needed, no horizontal scroll.

### Scene II: the maker (1.2–1.5 viewport)
Job: link Hephaestus to craft and prepare user authorship. Quiet mineral-paper scene with vertical workshop image occupying 45%, copy 45%, 10% gap. H2 "The gods had power. / One had a craft." Brief original retelling identifies metalworking/fire and the workshop, with myth reference available in credits. Supporting line "Not every legend begins with a victory. Some begin with the decision to make something." Link "Meet the maker" opens inline myth note with source and distinction between ancient story and our imagined atelier.
Motion: image reveal and gentle parallax, paragraph group short rise. This quieter scene is not pinned.

### Scene III: objects of intention (1.5–1.8 viewport)
Job: teach the three shapes and desired outcome before configuration. Dark gallery, large left product stage and right vertical numbered selector. Selectable relics:
- Aegis / To protect: round disc with orbit; "A boundary for what matters." Inspired by protection, an original design rather than an archaeological reconstruction.
- Pyr / To begin: triangular/diamond core with angular cage; "A spark for the unfinished." Fire as beginning, original design.
- Nostos / To return: elongated open ring/orbit with central star; "A reminder of the way back." Return as intention, original design.
Each selection changes artwork, short description and currently selected index. Arrow controls and keyboard-native selection buttons; no forced carousel. "Make this your own" preselects corresponding forge intention and goes to workbench. Descriptions are visible, not hover-only. Mobile stage above list, no horizontal clipping.

### Scene IV: the invocation (0.7–1 viewport)
Job: make the shift from witness to author unmistakable. Ember ground, dark huge text "A GOD MADE / THE FIRST. / YOU MAKE / THE NEXT." Text reveals by scroll in four lines, stays readable. Small supporting text "Choose an intention. Give it form." No CTA clutter; next scene visibly begins. This is a short ramp, not the peak.

### Scene V: the forge (2–2.5 viewport incl. introduction)
Job: deliver the promise. H2 "What will you carry?" and subheading "Three choices. One object of your own." Large stable 3D stage left; right workbench groups. All controls remain visible and operable, no mandatory wizard.
1. Intention: Protect / Begin / Return. Corresponding archetype Aegis / Pyr / Nostos. Whole silhouette changes.
2. Material: Bronze / Obsidian / Silver. Labeled swatches with descriptive names. Bronze: warm metallic; Obsidian: dark vitreous; Silver: cool reflective. Light stage remains dark, object sufficiently lit in all states.
3. Maker's mark: Sun / Wave / Laurel. Symbols appear on object and print; labels describe them.
Summary: "Aegis · Bronze · Sun", dynamically updated. Action "Forge my relic ↗". Nearby small text "A digital object. Yours to keep. No account required."
Preview: real Three.js authored mesh, camera perspective at 35deg, bounded DPR 1.5. Drag to rotate plus labeled rotate-left/right and reset controls; keyboard equivalent. All transition/rotation via GSAP and its ticker. Renderer starts only near viewport, stops when offscreen or document hidden. Static fallback shows recipe-specific illustrated art. Motion off is available alongside OS preference.
States: initial / changed / forging / created / recoverable error. Loading action disabled once while fetching; no fabricated progress. On server success run assembly sequence once, show result title and identifier, activate View relic / Download print / Copy link. On failure preserve all choices and offer "Try again" with plain error. Rapid clicks cannot create multiple overlapping states. Changing a choice invalidates an earlier displayed result and makes the need to forge again clear.
Persistence: after successful creation, save returned recipe token in localStorage collection, up to 12, clearly labeled local. Failure to save locally does not lose server-created link; show a notice and allow link copy.

### Scene VI: ownership and colophon (0.8–1.2 viewport)
Job: finish in possession rather than endless teaser. Display a quiet studio note "Nothing extraordinary begins without a maker." Credits name JBX Web Studio and mark concept status. "Your collection" opens an inline area with saved relic titles/links and individual Remove on this device actions. Empty state explains forging creates a relic. Credits disclose generated imaginary art, sources and font licenses. No invented client claims or fake main-studio contact URL.

Target total ~8–10 desktop viewport heights; adaptive mobile natural flow. Page density determined by actual render. Four distinct motion families: hero settle/parallax, image masking, gallery state transition, kinetic interlude, interactive forge assembly.

## 4. Secondary routes
- /relic/[token]: server-validated saved recipe with same 3D or illustrated preview, exact choices, crafted inscription, creation timestamp labeled UTC, unique record ID, download, copy and "Create another". Public only to those with link; do not call it private. All recipe content is curated enums; no PII.
- /credits: concise concept explanation, myth reference links, generated asset disclosure, font licensing and JBX authorship. Include privacy model: no accounts, no submission PII, local collection, ordinary hosting request logs.
- not-found: designed page with home/forge links for invalid recipe or unknown path.
- errors: route-level retry and home access.

## 5. Backend and data contract
Next.js App Router, TypeScript strict, React, GSAP, Three.js. Node runtime for API. Static and server-rendered content by default; isolate client experience, forge and 3D component. Shared catalog in lib/relics.ts has enums, display names, story text, material colors and symbol paths. Shared recipe schema version 1.

POST /api/relics accepts JSON {intention: 'protect'|'begin'|'return', material: 'bronze'|'obsidian'|'silver', mark: 'sun'|'wave'|'laurel'}. Enforce JSON content-type, small body cap, exact enum validation, bounded timeout client-side, same-origin check when Origin supplied. No paid compute or remote generation. Return 201 {token,id,url,recipe}; errors 400/413/415 with stable human message. Token contains recipe version, enum indices, server timestamp and random nonce; base64url, maximum fixed length, checksum for accidental corruption (not a security signature). No raw free text or active markup.

GET /api/relics/[token] returns validated record, 404 for invalid token. GET /api/relics/[token]/print returns attachment SVG at 1200x1600, archival border, original vector drawing from recipe, clear form/material/mark, inscription and record identifier. XML escape all rendered text even though catalog is curated. Set image/svg+xml, nosniff, safe attachment filename, sandbox content policy. Print uses same catalog and token parsing as page.

The shared URL IS the portable record. It is not a claim of remote database persistence or NFT ownership. It can be reopened without the creating browser. Local collection is convenience, not the authority. No environment secrets are required. Document this architecture plainly in README and credits.

## 6. Implementation order and ownership
1. Record brief/design/ideation/plan audits.
2. Generate and inspect hero, workshop and three relic images; optimize to AVIF/WebP, copy into public.
3. Scaffold Next.js strict project, shared recipe catalog and API contract.
4. Build server routes, archival print and negative-path tests (delegated independent backend slice).
5. Build authored Three.js relic component with GSAP animation and fallback (delegated graphics slice).
6. Build page composition, responsive CSS, semantic controls, gallery, forge integration and ownership flow.
7. Add scoped GSAP timelines, ScrollTrigger and optional desktop ScrollSmoother, reduced motion and toggle.
8. Run type/build, backend tests, Playwright real browser tasks, accessibility and screenshot sweeps.
9. Independent audit; fix findings; capture final visual proof.
10. Create new repo, push main, create connected Vercel project, verify production URL plus API/share/download, push one follow-up if required to prove Git deployment.

## 7. Verification matrix and release proof
- Visual: 1440x1000, 1920x1080, 768x1024, 390x844, 320x740; inspect hero, each boundary, intermediate motion, forge all materials and result.
- Behavior: links, menu, myth disclosure, each gallery selection, all 27 recipes via API, chosen combination through UI, rapid submission, failure retry, local collection, reload, cross-context shared URL, download XML, copy feedback.
- Accessibility: headings/landmarks, keyboard entire forge without drag, focus visible, 320px no overflow, reduced motion no long motion/pins, screen-reader live state, image descriptions, axe automated plus manual checks.
- Resilience: JS-disabled useful story and clear forge requirement, WebGL failure static preview, storage disabled no crash, malformed/tampered/large token, invalid body, body-size cap, non-JSON, network interruption, route 404.
- Performance: optimized hero with explicit sizes; lazy later images and Three.js; no offscreen animation loops; inspect production Lighthouse metrics as lab evidence, not field claims. Target LCP 2.5s and CLS .1 while recording actual findings.
- Shipping: remote new repo correct owner, no tokens/local skill caches tracked, production build green, Git integration linked, public alias reachable without auth, fresh production API and download tested.

## 8. Reference application
Premium Digital Design Reference pages 3–4: audience/task precede styling. Pages 6–14: hierarchy, grouping, balance and rhythm tested at multiple sizes. Pages 15–19: readable type, semantic color, reduced motion and visible state. Pages 21–24: honest concept work and clear next action. Pages 26–29: recovery, useful interaction, responsive relationships. Pages 31–32: gate core task failures regardless of visual quality; audit evidence rather than aspirational ratings.

External research: Theoi Hephaestus source collection https://www.theoi.com/Olympios/Hephaistos.html ; Awwwards experimental directory https://www.awwwards.com/websites/experimental/ for category context, not copied layout; Google Fonts Marcellus and Manrope; official GSAP ScrollSmoother docs. Do not copy source wording into the experience.

# HEPHAESTUS / Independent plan review

Reviewed: `docs/BLUEPRINT.md`, root `PRODUCT.md`, and root `DESIGN.md`. This is a review of intended behavior, not evidence that the implementation passes. The source design-reference PDF was not independently inspected in this review; page references in the blueprint remain the planning author's attribution.

## Decision

Proceed with the divine atelier. The intention → form → material → mark → finished record journey is comprehensible without mythology knowledge, produces a useful artifact, and gives the visual ambition a functional purpose. The stateless record architecture is proportionate to a fictional digital object with no accounts or commerce. The decisive quality test is whether the workbench earns the promise made by the opening.

## Fixes to apply before and during implementation

### 1. Establish the live object before producing its marketing imagery — high priority

The implementation order currently generates three collection images before building the actual geometry. Independent image generation can produce ornate structures, textures, and engravings the live renderer cannot reproduce. Calling the print an illustration does not solve a mismatch between a selected gallery object and the resulting forge object.

**Fix:** finish a representative live object, its silhouette family, and one complete recipe-to-print path first. Use those silhouettes as the source of truth for gallery assets. Prefer renders of the actual geometry for collection selectors; reserve generated imagery for the maker and workshop. If illustrations remain, visibly identify them as studies and keep their silhouette, cage, core, symbol position, and proportions aligned with the live objects.

**Why:** the website's central promise is visible and reproducible choice. Object continuity matters more than atmospheric image fidelity.

### 2. Treat the share URL as a portable recipe, with precise provenance language — high priority

The blueprint correctly states that its checksum is not a security signature. Consequently, a well-formed record can be reconstructed or modified by anyone familiar with the format, including its timestamp. It is not an independently authenticated issuance certificate. A stateless URL also does not create a private server-side vault.

**Fix:** use “digital relic record” or “archival print” in visitor copy. Do not imply certified authenticity, verified ownership, scarcity, or an audit trail. Keep versioned parsing strict: exact field count, enum bounds, token length, timestamp representation, nonce format, and malformed encoding all need defined outcomes. Ensure older valid versions remain readable after catalog changes, or document the compatibility boundary. The server may assign the timestamp when creating a record, but the UI must not portray an unsigned timestamp as independently verified.

**Why:** this keeps the actual backend useful without attaching unsupported meaning to it. A signing service or database is unnecessary for the current brief.

### 3. Make the gallery and forge one continuous choice — high priority

The collection asks the visitor to choose an object, while the workbench offers an intention that can choose a different object. This is sensible only if the mapping is explicit and preserved.

**Fix:** use the same order, names, descriptions, and object illustrations in both sections. “Make this your own” must select that intention before navigation, preserve the visitor's other choices, and put the selected state in view. Introduce each gallery object with both its name and intention. After forging, changing any choice must remove the previous result actions from the active state or clearly label them as belonging to the earlier relic.

**Why:** a visitor should never need to understand internal state to know which object they are making or downloading.

### 4. Keep the forge available within a short visit — high priority

Eight to ten desktop viewport heights can work as an optional exhibition, but the stated audience may have only a few minutes. Mobile text flow can increase this length substantially. A large invocation scene can become a second introduction after the visitor is already ready.

**Fix:** keep the direct forge action visible at entry and available through navigation. Treat viewport estimates as ceilings, not mandatory section heights. Check a realistic phone journey in which the visitor chooses a relic, forges it, and downloads it without waiting for reveal sequences. Compress the invocation on small screens when it delays the workbench. Never make text visibility dependent on motion completing.

**Why:** the strongest portfolio proof is a finished visitor action, not maximum scrolling distance.

### 5. Design the worst material state first — high priority

Obsidian against charcoal is the most likely combination to disappear, while silver can clip into white and bronze can look like flat orange plastic. A color change alone does not fulfill the material promise.

**Fix:** tune lighting with all three materials and all three silhouettes in the same camera. Use controlled edge illumination, roughness, environment reflections, and silhouette contrast. Give each mark sufficient relief or contrast to remain legible without rotation. Inspect the default angle, mobile size, and static fallback for every material. Keep the print's material treatment distinguishable as well.

**Why:** material selection is one third of the interaction and must produce an observable consequence on an ordinary phone display.

### 6. Make renderer failure and motion settings first-class states — medium priority

The blueprint covers initialization failure and reduced motion, but a WebGL context can also be lost after initialization. An idle renderer can continue consuming resources even when object animation has finished. “All motion through GSAP” does not itself ensure either issue is handled.

**Fix:** include context-loss recovery or a persistent illustrated fallback, expose the same recipe and result actions in both modes, and render on demand where possible. Define pause/resume across viewport visibility, hidden documents, reduced-motion preference, and the explicit motion toggle. Clean up GSAP listeners and Three.js resources on route changes. Avoid desktop smoothing unless it passes keyboard, anchor, sticky-header, and focus navigation checks.

**Why:** graceful degradation should preserve the actual product, and optional visual polish should not degrade normal browsing.

### 7. Ground visual review in evidence rather than adjectives — medium priority

“Premium,” “cinematic,” and the named exhibition-to-workbench grammar are direction, not measurable acceptance criteria. The typographic interlude introduces a much stronger color field than the rest of the page and could feel disconnected.

**Fix:** review a contact sheet containing hero, origin, gallery, invocation, forge, and record at desktop and mobile sizes. Check shared light direction, material palette, typography, object scale, and caption placement. Carry the ember color through small meaningful actions before its large appearance. Inspect Marcellus's tight tracking at actual sizes instead of assuming the prescribed value works everywhere. Keep meaning-bearing labels comfortably readable; 11px is a floor, not a target.

**Why:** cohesion is a relationship between scenes. A set of individually attractive screenshots can still fail as one experience.

## Reference application and limits

The blueprint translates its stated reference principles into useful concrete requirements: audience/task before styling; hierarchy through one dominant stage; visible state and recovery; honest fictional authorship; responsive relationships; and core-task release gates. These are stronger than copying a reference layout. This review does not independently validate the cited PDF page numbers, the exact historical source claims, current external documentation, actual contrast, or actual performance. Those require direct source or implementation checks.

## Practical release gate

The plan is ready to execute when a representative slice can change form, material, and mark; create a validated recipe; display matching record and print; reopen that record in a new browser context; and survive a failed request without losing choices. Before release, inspect all 27 recipes for readable silhouettes and marks, use keyboard and touch-sized controls through the complete flow, exercise invalid records and disabled storage, and confirm the production download and share route. The blueprint's broader verification matrix remains appropriate; record results and unresolved limitations rather than aspirational pass claims.

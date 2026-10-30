# HEPHAESTUS / Bounded redesign visual review

Reviewed the updated `components/Experience.tsx` and `app/atelier.css` plus the current desktop/mobile captures in `artifacts/screenshots` on 2026-10-30 UTC. This is a visual review of the supplied implementation snapshot, not a repeated functional audit. The main task owns the known 320px overflow investigation; it is excluded below. No application files were edited.

## Assessment

This is a meaningful improvement. The warmer limestone surface works better with the existing workshop image; the offset bronze detail gives the maker scene a clear foreground; thumbnail selection is more informative on desktop; the shorter invocation has better pacing; and the mobile workbench finally puts the live object and choices within the same viewport. The new primary action has enough physical weight to suit the forge. Preserve those changes.

The result is still closer to a carefully dressed sequence of sections than a continuous foundry. Layering now exists inside the maker and gallery, but the principal scene boundaries retain the original full-width band structure. This is a design judgment about the brief, separate from the two definite mobile layout defects below.

## Remaining actions, ranked

### 1. Fix words joining when mobile line breaks disappear

**Evidence:** `mobile-invocation.png` shows “What willyou carry?”; `mobile-close.png` shows “extraordinarybegins.” Source locations: `components/Forge.tsx:271`, `components/Experience.tsx:719`, `app/atelier.css:920`, `app/globals.css:1717` in the reviewed snapshot.

Hiding a `<br>` does not introduce a space between its neighboring text nodes. These are prominent headings, so the result immediately looks unfinished even though the intended wording is apparent.

**Fix:** preserve real inter-word whitespace independently of the responsive line break, or use responsive block spans with deliberate spaces. Inspect every heading where a breakpoint changes a break's display. Verify 390px and 768px, not only the 320px overflow case.

### 2. Stack each mobile gallery name and meaning

**Evidence:** `mobile-collection.png`: “Aegis” sits beside a tiny two-line “To protect”; the Pyr and Nostos meanings drift to the right of their names. The three buttons appear to have inconsistent internal alignment. `app/globals.css:1596` gives `.study-name` a flex layout, while the new mobile rules at `app/atelier.css:856` change its font size without replacing that arrangement.

The new horizontal tab row is a useful compact structure, but each tab still contains the old horizontal name/meaning structure. This compounds two layouts inside a narrow width.

**Fix:** explicitly stack the name and meaning with a shared center alignment and consistent vertical gap. Keep each meaning on one line at 390px where possible. Preserve the active underline and full touch target. Do not solve this by shrinking the labels further.

### 3. Close the visual quality gap between study and live object

**Evidence:** compare `desktop-collection.png` with `desktop-workbench.png`. The study has a richly weathered bronze sun face with engraved detail. The live object presents a comparatively flat olive center with fine raised lines. The outline remains related, but the material character and perceived craft change sharply when the visitor reaches the product interaction.

The redesign improves the setting without yet addressing this central handoff. Existing disclosure makes the distinction honest; it does not remove the perceptual drop.

**Fix:** give the live face a material treatment that belongs to the selected metal, with controlled texture/roughness and stronger mark definition. Reduce the persistent olive appearance in the bronze state. If the richer study cannot be matched within scope, move it into a secondary inspiration/detail role and let the actual live object introduce the selectable relic. Avoid adding another atmospheric image to compensate.

### 4. Make one scene boundary carry the spatial idea

**Evidence:** `desktop-maker.png` contains a successful overlapping detail; `desktop-collection.png` adds an ordinal and a clipped image corner; `desktop-invocation.png` still shows a complete orange rectangle followed immediately by a new dark eyebrow/heading block. The boundaries do not inherit the layering present inside the scenes.

This is the remaining gap against the “continuous foundry” direction. More parallax within isolated rectangles will not change the overall page reading.

**Fix:** choose one transition, preferably collection → invitation → bench, and let a meaningful object contour or foreground element persist across it. Let the bridge's contour drawing meet the arriving live stage, or allow the stage to overlap the bridge edge while its controls remain on a stable dark surface. Reduce the duplicate introduction between “Your turn to make” and “What will you carry.” One resolved transition is more valuable than additional ornaments throughout the page. Keep text collision-free and preserve the simple reduced-motion state.

### 5. Remove the duplicated opening sentence

**Evidence:** `desktop-hero.png` and `mobile-hero.png` show “A WORKSHOP BEYOND OLYMPUS” above the title and the same sentence again in the supporting copy. Source: `components/Experience.tsx:432` and `components/Experience.tsx:446`.

The upgraded hero action makes this repeated text more noticeable: both small text blocks introduce the setting, while neither immediately specifies the useful outcome.

**Fix:** keep the location phrase once. Use the supporting sentence to explain the actual action and keepsake, for example choosing a form, material, and mark to create a digital relic. Preserve the short, confident tone; no extra paragraph is needed.

## Finish criteria

First resolve the two mobile defects and duplicate copy, then inspect the bronze/material handoff and one shared transition. Recheck the already improved mobile workbench at its start, middle, and end so the sticky object does not obscure controls or the result. The reviewed captures do not show accidental clipping within the maker or bridge compositions; image corner cuts, cropped details, and a partially visible ordinal at the bottom of a viewport are intentional framing or ordinary scrolling, not defects by themselves.

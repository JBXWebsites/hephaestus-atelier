# HEPHAESTUS / 21st-inspired revision

Release review: 30 October 2026 UTC.

## Outcome

The revision retains the fictional divine atelier and its working relic generator while replacing several generic visual treatments and correcting interaction defects. The independent critique and public 21st catalog research are preserved in `21ST-COMPONENT-RESEARCH.md`, `21ST-THEME-RESEARCH.md`, and `REDESIGN-CRITIQUE.md`.

- Warm limestone maker scene, architectural crop, and an overlapping bronze detail with coordinated GSAP depth.
- Custom orbit links and a tactile forge action derived from the atelier's own material language.
- Thumbnail exhibition index, offset study number, clipped image framing, and equal-width mobile selectors.
- A shorter invitation, continuous charcoal collection-to-forge surface, fewer redundant slogans, and corrected heading spacing.
- Compact mobile preview stays visible while choosing; keyboard and touch controls remain exposed.
- Burnished bronze center with procedural surface detail, replacing the flat olive inset. All nine bronze form/mark combinations were visually reviewed; idle rendering remains inactive.

No new generated artwork, catalog source copying, hosted UI generation, or additional animation framework was used. Existing generated art is still disclosed. The 21st references informed original implementation rather than a literal theme or component import. No copy credits were consumed.

## Defects addressed

1. Header and footer wordmarks now explicitly return to zero from natural scrolling, even with a same-path URL and no hash. Modified-click behavior remains native; route state is preserved.
2. Escape closes the mobile menu from either the trigger or a menu link and restores trigger focus.
3. Clipboard denial exposes a selectable share address and announces recovery; retry success is announced without stealing focus.
4. Known server validation errors are readable. Unknown server strings and malformed success records cannot appear as a valid creation. Transport failure and a 15-second timeout provide distinct retry guidance.
5. Failed local collection writes keep the visible collection intact and explain the failure.
6. Narrow gallery labels no longer overflow at 320px. Responsive headings preserve spaces when line breaks disappear. The workshop caption has a bounded width so the foreground detail cannot cover its words at tablet sizes.

## Verification evidence

- Next.js production build and TypeScript check pass.
- Eleven backend tests pass, including all 27 create/read/print recipes and invalid-input handling.
- Browser suite covers twenty flows: creation/record/download/removal, retries and stale requests, 390/320px keyboard and accessibility, invalid links, clipboard denial, malformed/server/timeout responses, normal and reduced-motion header/footer navigation, anchor placement, Escape focus, motion persistence, saved-record navigation, and mobile preview/control co-visibility with real touchscreen events.
- The 21st deterministic review reports zero findings on Experience, Forge, OrbitLink, and the revised stylesheet after moving surface colors to shared tokens.
- Desktop and phone scene captures are in `artifacts/screenshots`. Additional 600/768px layout captures and 1024/1920px width measurements found no horizontal overflow. The rendered bronze review is in `artifacts/renderer-polish`.
- Test synchronization was strengthened after observing the document height change when ScrollSmoother incorporates expanded or lazily loaded content. Tests use physical pointer coordinates only after the target is stable and unobscured; they do not force-click hidden controls.

At 1440×1000, the forge begins around document y3352 versus y4146 before the revision: approximately 794px earlier. At 390×844 it begins around y3208 versus y3824: approximately 616px earlier. These are measured rendered positions, not a fixed guarantee across viewport sizes.

## Independent review resolution

The snapshot reviewed in `REDESIGN-VISUAL-REVIEW.md` preceded the final finish pass. Its joined-heading words, crowded gallery labels, duplicate opening sentence, olive bronze center, and abrupt orange bridge have all been addressed. The final page still uses semantic chapters; the design intentionally keeps a clear reading order rather than forcing overlapping imagery across every boundary. The photo studies and actual live geometry remain different media, with clear disclosure.

## Practical scope

Verification uses Chrome, emulated screen sizes and touch, automated accessibility rules, and visual inspection. It is not a physical-device or assistive-technology certification. Public performance and deployment evidence are recorded below after the production release. Existing stateless records and device-local collections retain their documented semantics; no accounts, payment, or database were added.

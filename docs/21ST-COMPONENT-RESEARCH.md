# 21st component research and applied direction

Reviewed 29–30 October 2026 for the requested HEPHAESTUS revision. Companion documents: `21ST-THEME-RESEARCH.md` records the independent theme/gallery research; `REDESIGN-CRITIQUE.md` records the initial rendered-site critique and the attributed discussion of generic AI aesthetics.

## Access and method

Read the 21st CLI and UI-build skills, initialized the project design context, and attempted catalog searches. The CLI requires authentication in this environment. Continued through the public [component catalog](https://21st.dev/community/components), [theme catalog](https://21st.dev/community/themes), detail pages, and live demos using the browser. No copy credits were used, no hosted generation was requested, and no component source was copied or installed. These are inspected references for locally authored React/CSS/GSAP code.

## Interaction and motion references

| Reference | Inspected evidence | Adopted principle | Deliberate exclusions |
| --- | --- | --- | --- |
| [Interactive Hover Button — Dillion Verma](https://21st.dev/@dillionverma/components/interactive-hover-button) | Detail page, public demo, idle and activated/hover states; arrow and fill feedback | A link should acknowledge intent with precise feedback. `OrbitLink` uses a fixed hit area, a rotating broken orbit, and a small inner arrow response. Keyboard focus receives equivalent emphasis. | The demo's pill shape, black/white palette, and literal implementation. |
| [Texture Button — cult/ui](https://21st.dev/@cult-ui/components/texture-button) | Detail page and public button preview; raised/inset edges and visual hierarchy | The forge action has a restrained mineral surface, inset edge, and separate dark arrow plate. This suggests a tool rather than a generic SaaS CTA. | Purple accents, heavily rounded corners, deep neumorphic shadows. |
| [Parallax Scrolling — Osmo](https://21st.dev/@osmosupply/components/parallax-scrolling) | Detail page and scrolled live preview; landscape, person, and type move at distinct rates; GSAP/Lenis metadata | Depth comes from two related planes: workshop architecture and a closely cropped detail of its bronze object. GSAP moves them at different rates over a bounded distance. | Demo artwork, Lenis, multiple competing smooth-scroll systems. |
| [Zoom Parallax — Efferd](https://21st.dev/@efferd/components/zoom-parallax) | Detail page and scrolled live image wall; differing image scales; Framer Motion metadata | Vary scale and cropping within one coherent visual story. The small bronze detail interrupts the large architectural view. | Seven unrelated pictures, extended pinning, or importing Framer Motion. |
| [Scroll Expansion Hero — Arunachalam](https://21st.dev/@arunachalam/components/scroll-expansion-hero) | Public description, usage, and dependency metadata; live behavior not independently tested | Considered and rejected: the existing statue already owns the opening. A second expansion mechanism would postpone the useful action. | No claim of live preview verification or source reuse. |

Theme/gallery research adds nine candidates, including Zen Linen, Hotel Showcase, Lumina Interactive List, Sticky Scroll, and Spatial Product Showcase. The result adapts selected principles from this combined research; it does not assemble every demo into the page.

## Governing composition

The visitor enters a volcanic workshop, encounters the maker and his materials, examines three imagined studies, and then shapes a live object. The site's own bronze rings, carved marks, stone, and fire guide the control language. The light chapter is warm limestone; the collection, invitation, and workbench share a dark surface. Ember identifies action, selected controls, and the shift from looking to making.

### Threshold

Retain the commissioned-for-this-project imagery and Marcellus/Manrope pairing. Remove the duplicated opening line. Replace the generic underlined principal CTA with the custom orbit link. Preserve a direct forge shortcut in the persistent header. The wordmark must work from any scroll position, including when the URL is already `/` without a hash.

### Maker

Use an asymmetrical architectural image and readable text, with one square bronze detail overlapping the image. The detail introduces the same Aegis study encountered next, so the overlap has narrative meaning. Warm paper and modest shadow distinguish the two physical planes. Keep parallax bounded to approximately 70px of detail travel and 12% total architectural image travel; no continuous idle animation. A static composition remains complete with reduced motion.

### Collection

Use a large clipped photographic stage, offset object number, and coordinated thumbnail index. Three choices remain native buttons with visible selected state; no autoplay or cursor-only information. On phones, the three names and meanings form an equal-width horizontal selector below the image, with each meaning on its own line. The active story and “Make this your own” carry the selected intention into the real forge.

### Invitation and workbench

Shorten the original 843px desktop interlude. Share the dark surface with the collection and forge so the transition is continuous. Use ember inscription type and a thin orbital drawing; opposing text movement is slow and tied to scrolling. The forge remains reachable immediately from the header.

On desktop, keep one broad live object beside a narrower choice rail. Differentiate intention labels, material samples, and maker's marks while keeping one selection rule. On phones, keep a compact preview sticky within the workbench, beneath the header, so changing a material or mark does not hide its result. The preview releases at the workbench boundary. Preserve labeled rotation/reset controls, the readable recipe, result, download, and share behavior.

### Finish and reliability

Keep the actual live object consistent between configuration, result, record, and print. Preserve the disclosure that photographic studies are imagined art. No new generated images were added in this revision. Avoid asserting that visual style proves or conceals AI authorship.

Fix logo navigation explicitly rather than relying on Next's same-path scroll behavior. Preserve modified-click behavior and route history state. Escape must close mobile navigation and return focus. Clipboard failure must expose a selectable link. Server rejection, malformed responses, transport failure, and timeout must produce useful recoverable states without exposing arbitrary server error strings. A failed local collection write must not pretend an item was removed.

## Review gates

1. Inspect actual desktop, tablet, 390px, and 320px renders and intermediate scroll positions.
2. Check spacing, heading word separation, thumbnail legibility, image clipping, and the sticky preview's relationship to controls.
3. Test ordinary pointer scrolling and logo navigation in both motion modes, keyboard menu use, anchor placement, and stored motion preference.
4. Exercise successful forging, all choice categories, repeat selection, saved collection, record, sharing/download, and failure recovery.
5. Run production build, type check, backend tests, browser accessibility/interaction tests, and performance measurement.
6. Publish to the existing GitHub/Vercel project, verify the deployed revision, and repeat the critical public-site checks.

Changes that add motion without improving orientation, feedback, or the relationship between these materials are excluded. Passing tests supports functional confidence; visual review remains a separate judgment.

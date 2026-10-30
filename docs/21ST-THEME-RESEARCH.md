# 21st.dev theme and exhibition research

Research date: 2026-10-29. Scope: themes, editorial galleries, product displays, and sticky layouts for HEPHAESTUS. This is inspiration research; no application code, packages, or external account settings were changed.

## Evidence and access

Read the installed `21st-cli-use` skill. Ran metadata searches for `editorial`, `dark --type theme`, and `gallery`. All returned an authentication requirement. Continued through the public catalog, public theme token pages, and the existing browser session. No component code retrieval, generation, installation, copying, or bookmarking was performed. The browser still displayed two free copies available.

Entry points: [Components](https://21st.dev/community/components), [Themes](https://21st.dev/community/themes). Identifiers below are verified author/slug identifiers; numeric CLI IDs were unavailable without authentication.

## Theme candidates

### 1. Zen Linen — strongest palette reference

- ID: `@serafimcloud/themes/zen-linen`
- [Theme and public tokens](https://21st.dev/@serafimcloud/themes/zen-linen)
- Inspected the catalog swatch and live theme preview, including its neutral button hierarchy. The preview specifies Inter and a `0.5rem` radius; neither should replace this project's established typography or squared controls.
- Verified light tokens: background `#E9E4D8`, foreground `#1E1E1E`, primary `#2E2E2E`, secondary `#D8D2C4`, card `#F4EFE4`, border `#D2CBBB`.
- Verified dark tokens: background `#141414`, foreground `#E8E3DA`, primary `#D1CFC0`, secondary `#222222`, card `#1C1C1C`, border `#2C2C2C`.
- Use its warm neutral relationship to make the pale chapters feel like limestone exhibition labels. Keep Hephaestus's ember accent and Marcellus/Manrope identity. This is a palette reference, not a wholesale theme import.

### 2. Vintage Paper — archival reference

- ID: `@serafimcloud/themes/vintage-paper`
- [Theme and public tokens](https://21st.dev/@serafimcloud/themes/vintage-paper)
- Catalog swatch visually inspected; both token sets read from the public detail page.
- Light: background `#F5F1E6`, foreground `#4A3F35`, primary `#A67C52`, border `#DBD0BA`.
- Dark: background `#2D2621`, foreground `#ECE5D8`, primary `#C0A080`, border `#4A4039`; radius `0.25rem`.
- Useful for a record, provenance label, or download presentation. Avoid applying its brown tint to the entire website: it would weaken the sharper volcanic/mineral contrast and compete with the bronze object.

### 3. Graphite Mono — contrast reference

- ID: `@serafimcloud/themes/graphite-mono`
- [Theme and public tokens](https://21st.dev/@serafimcloud/themes/graphite-mono)
- Catalog swatch and public token sets inspected.
- Dark background `oklch(0.205 0 0)`, foreground `oklch(0.985 0 0)`, card `oklch(0.165 0 0)`, border `oklch(0.269 0 0)`; radius `1rem`.
- Useful evidence for a restrained dark hierarchy. Reject the large radius and pure-gray neutrality for the atelier; retain the project's slight mineral hue and precise edges.

## Component candidates and preview findings

| Candidate / verified identifier | Evidence inspected | What transfers | What to reject |
|---|---|---|---|
| [Hotel Showcase](https://21st.dev/@kedhareswer/components/hotel-showcase), `@kedhareswer/components/hotel-showcase` | Live fullscreen preview; selected “Serenity Peaks” and observed the list-to-detail transition. Metadata explicitly identifies GSAP. | A concise typographic list becomes a large image and prominent title while preserving visual continuity. | Excessive empty space in the demo, oversized unrelated destination list, and its literal photography. Preview credits Osmo; treat this as behavioral inspiration, not unverified source reuse. |
| [Lumina Interactive List](https://21st.dev/@hardikkashiyani123456788/components/lumina-interactive-list), `@hardikkashiyani123456788/components/lumina-interactive-list` | Live image transition, centered serif title, edge counters, and ruled index strip inspected. | Image ownership of the stage; coordinated image/title/index changes; index that feels like exhibition navigation. | Autoplay observed during inspection, text across a busy image, and low-contrast inactive labels. |
| [Sticky Scroll](https://21st.dev/@uilayout.contact/components/sticky-scroll), `@uilayout.contact/components/sticky-scroll` | Fullscreen preview scrolled from introductory text into a three-column architecture image wall. Metadata lists Lenis and links to UI Layouts. | Sticky positioning can create editorial layering without replacing normal document flow. | The literal repeated image wall, blue technical grid, emoji instruction, and another smooth-scroll library. |
| [Spatial Product Showcase](https://21st.dev/@daiwiikharihar/components/spatial-product-showcase), `@daiwiikharihar/components/spatial-product-showcase` | Live preview and dependency metadata inspected. | One dominant object beside one concise specification area; selection is visibly connected to the display. | Blue glow, fake technical statistics, floating gadget dock, and Framer Motion dependency. |
| [Portfolio Gallery](https://21st.dev/@isaiahbjork/components/portfolio-gallery), `@isaiahbjork/components/portfolio-gallery` | Preview and metadata inspected; Framer Motion listed. | Hover/focus can establish a clear active item. | Overlapping card pile and mobile marquee obscure three important choices. Not a good primary collection structure here. |
| [Project Showcase](https://21st.dev/@jatin-yadav05/components/project-showcase), `@jatin-yadav05/components/project-showcase` | Public description and dependency metadata read; live behavior not tested. | Quiet list structure is a useful alternate gallery scaffold. | Cursor-following imagery as the only preview would disadvantage touch and keyboard users. |

## Three precise patterns to implement

### Pattern A — The exhibition index becomes the exhibit

Sources: Hotel Showcase's transition and Lumina's image/title/index coordination.

Use three large typographic rows: `01 Aegis / To protect`, `02 Pyr / To begin`, `03 Nostos / To return`. Each row contains its short intention sentence, a visible active indicator, and a real button. Pair the index with one uncropped, generously scaled relic image. Let selection reveal an exhibit detail: image expands within its reserved stage, name moves to the image's lower edge, and a brief provenance note plus “Make this your own” becomes available. This gives the collection a meaningful action between looking and configuring.

GSAP translation: animate the stage image's scale/opacity and the title's `yPercent` in a coordinated 0.6–0.8-second timeline. Keep the stage dimensions stable. A shared-element move can use GSAP Flip if the DOM truly changes position; otherwise ordinary transforms are simpler. Cancel superseded timelines on rapid selection. Activate the same behavior on click and keyboard focus; never make hover the sole route. On mobile, place the image above the three rows and retain their full labels. No autoplay.

### Pattern B — A material chapter with a fixed visual anchor

Sources: Zen Linen's warm neutral hierarchy and Sticky Scroll's positioning model.

Give the maker/story chapter a pale mineral ground, a small persistent chapter label in the narrow left rail, and one large workshop image in the center. Place two short, staggered text passages beside it: the artisan's problem, then the visitor's invitation to make. The image should feel mounted in an exhibition rather than placed inside a card. Use visible source/provenance captions at its edge. The pale ground becomes an intentional pause between dark visual scenes.

GSAP translation: retain native scrolling. At wide viewports, use a bounded sticky image and ScrollTrigger for at most 6% image translation plus two short text entrances. Release the image before the next section. At phone widths and with reduced motion, render the same content in normal vertical flow. There is no reason to import Lenis or copy the demo's repeated masonry wall.

### Pattern C — The forge as an instrument and its object

Source: Spatial Product Showcase's object/specification relationship, with the established live relic viewer retained.

Replace a generic two-column panel impression with a deliberate asymmetry: the object occupies roughly seven columns and the choices occupy four, separated by a thin rule and one empty column. A small specimen caption sits directly above the object; the current recipe sits beneath it. Material choices pair a tactile swatch with a finish description. The chosen mark is shown large enough to inspect before forging. The result continues in the same control rail so the user's eye does not lose the object at the moment of completion.

GSAP translation: keep the real Three.js object and existing demand-driven GSAP rendering. Synchronize the final closure with a brief text reveal; do not add a second permanent glow or another animation library. Use a modest backdrop change between materials only if the object remains readable. Keep rotation/reset visible and retain every existing keyboard, reduced-motion, fallback, persistence, sharing, and download behavior.

## Recommended combination

Use Pattern A to make collection browsing memorable, Pattern B to give the page a stronger light/dark rhythm, and Pattern C to make the functional climax feel physically authored. Zen Linen is the best theme reference; Vintage Paper belongs only in archival details. The result should preserve an original Greek atelier identity rather than look like a collection of 21st demos.

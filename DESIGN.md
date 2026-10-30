# HEPHAESTUS / Design system

## Physical scene
A visitor stands in a dark volcanic workshop, facing a pale monumental sculpture illuminated by a narrow warm source; the workbench itself is clear, quiet and easy to operate. Charcoal is the space, limestone is the readable surface, ember is action.

## Color strategy
Restrained charcoal and warm limestone, with ember for selected states, action, and a brief typographic invitation. Collection, invitation, and forge share the dark ground. Canonical OKLCH tokens live in app/globals.css; the paper token is oklch(91.8% 0.017 85), warmed after the 21st Zen Linen reference review. Surface highlights and shadows derive from these tokens. Brass appears in material renderings, never as generic UI decoration. Focus uses pale yellow-green #dcf0a8.

## Typography
Voice words: chiseled, monumental, measured. Marcellus for inscriptions and major display; Manrope for precise, friendly controls and reading. Both self-hosted with licenses. Rejected reflexes: Inter, Cormorant, Playfair. Marcellus's inscribed forms are a subject-specific choice, not a generic editorial treatment. No italic editorial flourishes. Display 64–148px desktop, 52–80px phone, normal weight, line-height .97–1.06, tracking -.045em. Section titles 44–80px. Body 16–18px, line-height 1.65. Captions 11–13px, labels never below 11px, line length below 65ch.

## Layout and rhythm
Desktop 12-column underlying grid with about 58px outer gutters at 1440 and 20px at phone. Full-bleed hero; asymmetrical architectural maker spread with an overlapping bronze detail; clipped exhibit stage with an offset ordinal and thumbnail index; a short invitation that shares the forge's ground; compact colophon. Related items sit 12–24px apart, scene beats 42–86px apart. The principal action arrives earlier than in the original layout. Phone gallery selectors have three equal columns; names and meanings stack. Phone workbench keeps a compact live preview sticky below the header, released at the workbench's end. No decorative cards around prose.

## Visual assets
Original generated art, explicitly fictional. Hero: chalk-stone Hephaestus head and upper torso occupying right two-thirds against soot, orange light on face, generous dark left field for headline. Origin: workshop with monumental open doorway and single ember source. Collection: three sculptural relic studies with consistent dark backgrounds and raking light. Live object is authored geometry, not a still pretending to be configurable. Hero remains readable if images fail.

## Control language
Primary buttons are mineral-paper rectangles with a restrained inset edge and dark arrow plate, 64px minimum height. Narrative links use a custom broken-orbit seal with a fixed hit area and responsive inner arrow. Ordinary secondary links retain a 44px target. Choice buttons are grouped in fieldsets: typographic intentions, tactile material swatches, and recognizable marks share a selected baseline and fill. No reliance on color alone. All focused controls get a 2px high-contrast outline with offset. Inline status preserves selections on failure and states the actual result; a failed clipboard write exposes a selectable address.

## Motion ownership
All authored motion is GSAP. Intro typography 0.9s power3.out, short stagger; image settle 1.4s power2.out. Scroll-linked transform scrub .6; no automatic continuous motion lasting over five seconds without pause. ScrollSmoother only for fine pointer at desktop with no reduced motion; native touch scrolling. Forge transitions 0.55s power3.out, success 0.9s coordinated object/typography reveal. Hover 0.18s, focus immediate. No CSS animation/transition system, no Framer Motion. State must remain fully understandable with motion off.

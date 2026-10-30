# HEPHAESTUS / Design system

## Physical scene
A visitor stands in a dark volcanic workshop, facing a pale monumental sculpture illuminated by a narrow warm source; the workbench itself is clear, quiet and easy to operate. Charcoal is the space, limestone is the readable surface, ember is action.

## Color strategy
Restrained base with an intentionally large ember-red typographic interlude. Canvas #141614, elevated #1d201c, ink #eee9df, quiet ink #b3b6a9, mineral paper #d9dccf, deep ink #20251f, ember #e8754d, ember-dark #9b3c25. Implement the canonical tokens in OKLCH with these as visual references. Brass only appears in material renderings, never as generic UI decoration. Focus uses pale yellow-green #dcf0a8.

## Typography
Voice words: chiseled, monumental, measured. Marcellus for inscriptions and major display; Manrope for precise, friendly controls and reading. Both self-hosted with licenses. Rejected reflexes: Inter, Cormorant, Playfair. Marcellus's inscribed forms are a subject-specific choice, not a generic editorial treatment. No italic editorial flourishes. Display 64–148px desktop, 52–80px phone, normal weight, line-height .97–1.06, tracking -.045em. Section titles 44–80px. Body 16–18px, line-height 1.65. Captions 11–13px, labels never below 11px, line length below 65ch.

## Layout and rhythm
Desktop 12-column underlying grid with 56px outer gutters at 1440; 24px at tablet, 20px at phone. Maximum reading width 1360px. Full-bleed hero and sculptural interlude; quieter two-column origin; collection with one dominant image and a vertical index; one stable interactive forge; compact resolved colophon. Spacing family 8/12/16/24/32/48/72/104/144. Related captions 12–16px apart; sections 104–144px apart. Square surfaces, small 2px rounding only on controls. No decorative cards around prose.

## Visual assets
Original generated art, explicitly fictional. Hero: chalk-stone Hephaestus head and upper torso occupying right two-thirds against soot, orange light on face, generous dark left field for headline. Origin: workshop with monumental open doorway and single ember source. Collection: three sculptural relic studies with consistent dark backgrounds and raking light. Live object is authored geometry, not a still pretending to be configurable. Hero remains readable if images fail.

## Control language
Primary buttons are mineral-paper rectangles with dark label, an arrow aligned right, 52px minimum height. Secondary links have a thin baseline and 44px target. Choice buttons are grouped in fieldsets; selected choices have a visible outline, filled marker and text. No reliance on color alone. All focused controls get a 2px high-contrast outline with offset. Inline status reserves height, preserves selections on failure, and states the actual result.

## Motion ownership
All authored motion is GSAP. Intro typography 0.9s power3.out, short stagger; image settle 1.4s power2.out. Scroll-linked transform scrub .6; no automatic continuous motion lasting over five seconds without pause. ScrollSmoother only for fine pointer at desktop with no reduced motion; native touch scrolling. Forge transitions 0.55s power3.out, success 0.9s coordinated object/typography reveal. Hover 0.18s, focus immediate. No CSS animation/transition system, no Framer Motion. State must remain fully understandable with motion off.

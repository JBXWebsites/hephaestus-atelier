# Original artwork and asset direction

All five images were generated with the built-in image generation tool, inspected at full composition, then optimized into WebP with Sharp. No stock URLs or remote runtime image dependencies are used. Generation prompts were authored specifically for this website.

## Shared prompt preamble

“Art direction: a contemporary museum inside an ancient volcanic forge. Photoreal sculpture photography, monumental chalk limestone against deep soot-green charcoal, ember-orange raking side light, fine material pores, restrained film grain, hard sculptural edges, rich but controlled contrast.”

## Hero / public/images/hero.webp

Source: exec-49749e1d-c6fe-456a-98e3-000cec31792b.png. Landscape. A colossal limestone bust of Hephaestus, mature curly bearded craftsman looking slightly down and left. Right 62 percent composition, clean dark left field for live HTML type. Broken bronze halo, shadowed workshop, narrow ember rim and broad neutral stone lighting. Avoid fantasy illustration, plastic, text, logos, glowing eyes and magic beams. Image inspected: convincing sculptural texture and face, usable negative space; selected.

## Workshop / public/images/workshop.webp

Source: exec-08f1901a-e8c0-43c0-982c-fc4308e33603.png. Portrait. Monumental volcanic workshop, tall rectangular opening to a terracotta-lit chamber, rough basalt walls, low stone workbench with sparse bronze tools and a small ring. Dust in raking light, no people, no text. Image inspected: doorway establishes scale and light; warm color matches hero.

## Aegis / public/images/aegis.webp

Source: exec-f71435e2-0c39-4466-b34a-581d6e4cb348.png. Square. Bronze ceremonial disc, incised rings and sun, suspended in intersecting open orbits over basalt. Hammered aged surface, studio key, ember rim. Image inspected: visible disc, sun and orbit. Presented as an imagined study, not an exact rendering of the live geometry.

## Pyr / public/images/pyr.webp

Source: exec-f5478af0-8fec-4100-9ad5-92539c19739a.png. Square. Obsidian angular core in nested bronze triangular cage, tiny sun and a controlled ember crack. Above basalt, museum lighting. No neon, loot styling or text. Image inspected: distinct angular silhouette and controlled material contrast.

## Nostos / public/images/nostos.webp

Source: exec-7d5ca0ae-c4bd-4210-9b7c-191ad9cb251f.png. Square. Antiqued silver elongated elliptical orbit, intersecting ring, eight-point compass star and central wave motif. Photographic metal and basalt, warm workshop background. Image inspected: distinct vertical orbit/star composition; belongs to same material family.

## Runtime and derivative artifacts

Hero is 1536px wide; other final web images are 1000px wide. Phones receive a dedicated 560×1024 hero crop to avoid downloading the unused sides of the landscape composition. Next.js serves responsive optimized sizes for the remaining image stages. Fonts are local WOFF2. Live object texture and environment reflections are generated in code; no HDR network fetch. Prints are generated server-side as scalable SVG with the same recipe catalog. Gallery artwork is disclosed as artistic studies on the page and in credits.

To rerun compression from the original source files, place the named files in an external directory and run `node scripts/prepare-assets.mjs <directory>`. Raw originals are not required to run/build the site.

# Open24 / Dwella direction

Reference: [Dwella demo](https://demo.codeandchill.store/dwella/) and
[official template overview](https://codeandchill.store/templates/dwella).
Inspected through TinyFish on 2026-10-23. The demo is a single-page property
landing page with a photo hero, angled cards, sequential storytelling, an
interactive calculator, listing carousel, map, FAQs and a closing image.

The implementation is original Next.js/React code adapting that visual language
to Open24. It does not contain Dwella's paid source, financial claims, reviews or
fictional properties. The hero is a generated photograph rather than the
reference's house film. Header/menu, photo composition, warm neutrals, dark pill
buttons, broad whitespace and restrained lime highlights carry the reference.

## Visual system

One stylesheet: `src/app/globals.css`. No legacy override stack.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#f7f7f5` | `#171815` |
| Surface | `#ffffff` | `#22241f` |
| Inset surface | `#eeeee9` | `#2c2f27` |
| Heading | `#272925` | `#f1f2eb` |
| Muted text | `#666b60` | `#b5bba9` |
| Main action | `#282a26` | `#e5e9db` |
| Lime action | `#d8ed92` | `#d8ed92` |

Typography uses a local Arial/Helvetica sans-serif stack: tight, large editorial
headings and restrained body copy. The exact upstream font could not be
extracted; no claim of pixel-identical typography is made. The desktop container
is capped at 1240px. Major sections use 95px vertical space, reduced to 60px on
mobile. Cards use 12–18px radii; calls to action use pill shapes.

The base is the warm light theme. The existing theme preference still persists,
and the dark palette follows the same hierarchy without tinting photographs.

## Product mapping

| Reference pattern | Open24 implementation |
| --- | --- |
| House hero with angled listing cards | Neighbourhood photo and category links |
| Trust/intro metrics | Three actual capabilities, with no invented statistics |
| Buying process | Location, open-now filtering, directions |
| Savings panels | Time, verified details, saved places and directions |
| Cashback calculator | Search radius selector linked to real query parameters |
| Listings and neighbourhood map | Existing API-powered nearby results and map |
| Real-estate FAQs | Hours, location privacy, favourites, ownership and reports |
| Closing CTA and footer | Explore action and working internal navigation |

Every public route, shared form, account, business and admin component uses the
same system. Keyboard focus, menu dismissal, native FAQ controls, responsive
grids and reduced-motion behavior are included. New copy is translated into
English, Uzbek and Russian. Authenticated data flows require the existing
database and were not replaced with fictitious demo content.

Images and final generation prompts: `docs/ARTWORK.md`.
Verification, environment limits and Claude continuation: `docs/REDESIGN-HANDOFF.md`.

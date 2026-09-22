# TurkLuxx desktop hero

Open `index.html`, or run `python -m http.server 8765` and visit http://localhost:8765.

The reference-led hero uses semantic HTML and vanilla CSS. All custom classes use the `turkluxx-` prefix. At widths of 1200px and above, the complete hero and seven-item benefits strip occupy one viewport. The prior narrow-screen layout and sections below the hero are retained; no tablet/mobile redesign was performed.

Includes a gold wordmark, circular UK flag, citizenship card and passport, lifestyle message, climate card, and two telephone links to `tel:+18184347266`. Google Fonts provides Manrope, Cormorant Garamond and Oooh Baby (only for the lifestyle phrase).

Integration pending: connect the proposed navigation routes and `/contact?interest=citizenship` to published pages. English is the only configured language.

## Assets

- `assets/istanbul-family-hero.png`: AI-generated illustrative Istanbul villa scene, without website text or controls.
- `assets/turkish-passport.png`: AI-generated illustrative passport cover.
- `assets/uk-flag.svg`: circular vector flag.

Both raster assets were created with the built-in imagegen tool. Prompts are in `assets/image-prompts.md`. They are concept imagery, not photographs of a verified property. Existing assets remain in use by the prior layout and lower sections.

## Verification

Checked in headless Chrome at 1366x768, 1440x900 and 1920x1080. Hero height equals viewport height, the benefits strip ends at the viewport bottom, the flag is 36x36px, and the page has no horizontal overflow. Google Fonts loaded successfully. A 1440x900 preview is saved in `hero-desktop-preview.png`.

## Tilda

Upload the stylesheet and assets, update their URLs, include the font link and copy the `.turkluxx-sales-hero` section into an HTML block. The new styles are scoped to the desktop hero.

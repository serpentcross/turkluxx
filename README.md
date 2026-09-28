# TurkLuxx desktop hero

## Cloudflare deployment

Requires Node.js 22 or newer. Install the pinned deployment tooling with `npm ci`.

- Build: `npm run build`
- Deploy: `npm run deploy` (runs `wrangler deploy --config wrangler.json`)
- Check deployment safeguards: `npm test`

Wrangler's custom `build.command` runs `npm run build` before each deployment,
including direct `npx wrangler deploy` and preview version uploads. The build
removes old `dist/`, validates all required inputs, then copies the public files
without transforming their bytes or relative paths. A failure exits nonzero and
removes incomplete output, stopping deployment. `assets.directory` is `./dist`.
See Cloudflare's [custom build documentation](https://developers.cloudflare.com/workers/wrangler/custom-builds/).

`scripts/public-files.json` is the reviewed source allowlist: `index.html`,
`rengi-istanbul.html`, styles in `css/`, scripts in `js/`, every current villa
photo and floor plan in `img/`, and the public images in `assets/`.
`rengi-antalya.html` is also copied automatically if present.
When adding public assets, add their paths to the manifest; never edit or commit
`dist/`. The unreferenced source material in `materials/` is not published.
Repository files, documentation, local tools and unlisted files are not copied.
The builder rejects symlinks/junctions, metadata paths and assets over 25 MiB.

In Cloudflare Workers Builds, use the repository root as the **build working
directory**, `npm run build` as the build command, and `npm run deploy` as the
deploy command. The uploaded assets directory is exclusively `dist/`. Remove any
old CLI `--assets .` argument: explicit CLI overrides take precedence over Wrangler
configuration. For preview uploads use `npx wrangler versions upload --config
wrangler.json`. Do not bypass the custom build. The configured Worker name is
`turkluxx`; it must match the existing Cloudflare Worker. This checkout contained
no previous Wrangler configuration or Cloudflare CI workflow; account/dashboard
settings must be checked separately.

Current source blockers (preserved intentionally): the working tree has deleted
`assets/turkluxx-villa.png`, `assets/turkluxx-villa-2.png`,
`assets/turkluxx-villa-3.png`, `assets/turkluxx-villa-4.png`, and
`assets/rengi/master-plan.jpg`, although the pages still reference them. The build
fails until these required sources are available. An existing URL in
`css/rengi-istanbul.css` resolves to the absent
`css/assets/istanbul-family-hero.png`; this deployment change preserves that URL
and does not repair website content. Existing unfinished navigation routes are
also unchanged.

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

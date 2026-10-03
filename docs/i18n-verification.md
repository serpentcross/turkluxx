# Multilingual implementation and local verification

Implemented English, Russian, Spanish, Arabic, Turkish and Dutch on the homepage,
Rengi Istanbul and Rengi Antalya. Nothing was deployed. No real email was sent.

## Files changed

- .gitignore — ignores generated browser screenshots.
- index.html — shared i18n assets, canonical URL and split-phrase reading-order hints.
- rengi-istanbul.html — shared i18n assets and canonical URL.
- rengi-antalya.html — shared i18n assets and canonical URL.
- css/styles.css — removes an existing desktop wordmark offset that caused horizontal overflow.
- js/callback.js — translated validation and request status; lead contract remains unchanged.
- js/referral.js — translation attributes on the existing invalid-link screen only.
- js/rengi-villa-data.js — English descriptions extracted into the source catalog, referenced by keys.
- js/rengi-villa-explorer.js — dynamic messages, accessible media labels and callback headings bound to catalog keys.
- js/rengi-istanbul.js — localized master-plan viewer title.
- js/rengi-antalya-data.js — descriptions referenced by catalog keys.
- js/rengi-antalya.js — dynamic project messages, accessible media labels and callback headings.
- scripts/build.mjs — narrowly allows the six public locale JSON files.
- scripts/public-files.json — includes shared i18n assets and all six catalogs.
- scripts/build.test.mjs — verifies safe locale packaging.
- scripts/referral.test.mjs — corrects a stale invalid-code case to match the current MUHAMED whitelist.

## Files created

- js/i18n.js
- css/i18n.css
- locales/en.json
- locales/ru.json
- locales/es.json
- locales/ar.json
- locales/tr.json
- locales/nl.json
- scripts/i18n.test.mjs
- scripts/test-i18n-browser.mjs
- docs/i18n.md
- docs/i18n-audit.json
- docs/i18n-verification.md

The build generates dist/; browser checks generate ignored PNG screenshots in
build/i18n/. Temporary extraction/translation tooling was removed.

## Architecture and persistence

Each catalog contains 361 semantic keys. English is the source/fallback. Static
English HTML remains readable; text nodes and accessible attributes update in
place. Descriptions reference keys, and dynamic bindings retain control identity,
current selection, inline markup and the opening paragraph's styling. Property
measurements, paths, codes, collection names and backend lead labels are not
duplicated by language.

The native selectors offer English, Русский, Español, العربية, Türkçe and
Nederlands. Selection is stored under turkluxx_language. Optional ?lang=xx
landing hints are supported. Switching preserves ref/sub and existing referral
storage. Blocked storage still allows switching on the current page. No language
field was added to the existing lead API.

Arabic sets lang=ar and dir=rtl, uses appropriate text alignment, keeps the
original media orientation, adjusts directional CTA arrows, and isolates numbers,
measurements, ranges and phone numbers for bidirectional display. Split headlines
use natural reading order. Longer modal headings wrap at readable sizes.

## Routing and SEO

Existing production URLs remain unchanged. Language-path routing and hreflang
publication are deferred. They require static aliases or Worker routing, safe
asset resolution and independently crawlable localized rendering. Canonical URLs
point to the existing production pages. ?lang=xx is a client-side language hint,
not a substitute for localized SEO pages.

## Intentionally untranslated content

Brand, collection and proper names; postal address; email/phone; URLs; property
codes; numerical figures and measurement units; and text embedded in existing
raster floor-plan/map images. The corresponding HTML floor/room labels are
translated. Backend email templates and developer diagnostics remain English.
The unpublished, unreferenced legacy rengi-plans.js demo is outside the public
build. Existing commented-out content and external destination sites were not
translated.

The source audit is recorded in i18n-audit.json. Browser scans found no remaining
English source strings that should have a different translation in the selected
language. Shared vocabulary and proper names are covered by explicit catalog tests.

## Verification results

- npm.cmd test: **37 passed, 0 failed**.
- npm.cmd run build: **111 public files built successfully**.
- Git diff whitespace check: **passed**.
- English descriptions reconstructed from locale keys match the original source
  exactly, including existing trailing spaces. Both property-data objects match
  the original objects after resolving description keys; structural data is unchanged.
- Browser matrix: **six languages × three pages × desktop 1440px and mobile 390px passed**.
- All **11 Istanbul villas × six languages × photos, floor plans and location maps** passed at both widths.
- All **five Antalya projects × six languages** passed at both widths.
- Selector switching, document lang/dir, reload/navigation persistence, complete
  description text, paragraph styling, callback headings, accessible labels,
  translated validation/success/failure messages and no horizontal overflow passed.
- Canonical Istanbul/Antalya property context and codes remain in lead payloads;
  36 generic form submissions exercised the existing Worker with a mocked email
  binding and retained Referral: AHMAD.
- Invalid-referral screens on all landing pages, Continue navigation, direct
  visitors, AHMAD/VLAD attribution and ref/sub query retention passed.
- Language switching did not add or reinitialize tracking script elements.
- Missing/malformed translations and failed locale loads fall back to English;
  rapid switches resolve to the most recent choice; blocked storage is handled.
- Arabic mobile/desktop screenshots were visually inspected; media is not mirrored.

## Decisions before deployment

No unresolved functional blocker was found. Decide separately whether to pursue
crawlable language-path URLs and localized plan-image assets. These are deferred
extensions, not changes to the current production routing or imagery.

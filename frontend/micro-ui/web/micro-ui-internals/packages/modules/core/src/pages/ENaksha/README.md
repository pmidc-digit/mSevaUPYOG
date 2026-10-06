# eNaksha resource page

- Route: `/digit-ui/enaksha` (public route in core `App.js`).
- Component: `index.js`.
- Scoped responsive styles: `style.css`.
- Resource directory: `resources.json`, extracted from the public eNaksha homepage on 2026-10-05. Contains 13 menu categories and 288 links, including approved-colony and NOC records grouped by district.
- Source: https://enaksha.lgpunjab.gov.in/

This is a resource-page adaptation, not a pixel-for-pixel copy. Notices and programme descriptions are summarized. Login, registration, password recovery, live application status, professional directories and downloads link to the original services; no legacy authentication scripts or credential forms are embedded. Hidden placeholder professional records are not represented as real data. Original image carousel is not copied.

Refresh `resources.json` and review the dated notices when the source changes. Links without a source document are displayed as unavailable, rather than linking to `#`. The directory is a static snapshot; it does not fetch the source on every visit.

Verification: JSX/CSS parsing, HTTPS checks for all resource links, browser route rendering, and a Lalru search returning both colony and NOC links. The remote documents themselves were not individually checked for availability.

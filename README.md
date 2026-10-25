# Joseph Wilkes résumé routes

Stable public entry links for my portfolio. Each path carries a role-specific campaign label. Product management uses the FinOps résumé profile.

| Focus | Stable address |
| --- | --- |
| FinOps | https://joeywilkes12.github.io/resume-routes/finops/ |
| Data science | https://joeywilkes12.github.io/resume-routes/data-science/ |
| Data engineering | https://joeywilkes12.github.io/resume-routes/data-engineering/ |
| Product management | https://joeywilkes12.github.io/resume-routes/product-management/ |

These routes currently lead to my existing portfolio. Their destinations can be updated after tailored website pages are approved. They do not publish or modify that website. They label an entry link, not the identity of a visitor. Native UTM reporting depends on the analytics plan enabled at the destination.

QR codes encode the stable address. A clickable PDF link may add `?via=pdf`; this changes `utm_medium` from `qr` to `pdf_link` in the JavaScript redirect. The no-JavaScript meta-refresh and visible fallback use the default QR channel. Unknown input parameters are ignored; visitors cannot supply an arbitrary destination.

## Maintenance

Edit `routes.json`, then run `npm run build`, `npm test`, and `npm run test:links`. Generated pages live under `docs/`. GitHub Pages uses `docs/` on the reviewed `codex/profile-redirects` publication branch. A publishing-branch push publishes these redirects only. Future destination changes require explicit review and authorization. PR merges always require explicit owner approval.

GitHub Pages serves static HTML: these use `location.replace` with a meta-refresh and visible link fallback, not an HTTP 307 redirect. The noindex directive keeps these utility entry pages out of search results while leaving the portfolio's indexing intact.

For live-route verification run:

```sh
ROUTE_BASE_URL=https://joeywilkes12.github.io/resume-routes npm run test:links
```

This repository contains only public redirect content. Do not add job descriptions, application notes, credentials, private résumé metadata, or links to private repositories.

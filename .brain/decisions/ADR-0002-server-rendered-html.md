# ADR-0002 — The Home page is rendered on the server, from plain functions

- **Status:** accepted
- **Date:** 2026-08-21
- **Governs:** src/server.js, src/web/**, and every future slice that puts something on the Home page

## Context

REQ-BOOK-001 requires the Home page to show the Library as a Gallery. REQ-BOOK-011
requires the application to run under Node.js on a local development PC and
return that page. Nothing has been built above the store yet, so this is the
first slice that decides how the front end is produced — and every later slice
(REQ-BOOK-004, -005, -006, -008, -009) inherits it.

Two constraints bear on it. REQ-BOOK-013 requires only genuinely needed
dependencies, each with a recorded reason. And the client, answering the
ambiguity register on 2026-08-21, said of REQ-BOOK-008 that "a full page reload
is acceptable as long as the newly added Book is displayed immediately after the
operation completes" — which removes the usual reason to reach for client-side
rendering.

## Decision

**The server renders complete HTML.** `src/web/render-home-page.js` and its
siblings are plain functions from Books to an HTML string. `src/server.js` reads
the store, calls them, and writes the result.

No client-side framework, no JSON API, no build step, no bundler. The application
ships no JavaScript to the browser in this slice.

**Every interpolated value passes through `escapeHtml`.** This is not stylistic.
`rules/javascript/security.md` makes user-supplied content in `innerHTML` a
blocking finding and notes that in a library application the Book title *is* user
content; string interpolation into HTML carries exactly the same hazard. One
escaping function, one place, asserted by a test.

**The stylesheet is served from a fixed route, not a static file server.** A
hand-rolled static server is the most common place a plain-JS project goes wrong,
and `rules/javascript/security.md` says so directly. There is no path joining
from a caller-supplied string anywhere in `src/server.js`; one URL maps to one
known file. Path traversal is not defended against, it is made impossible.

## Alternatives considered

**A JSON API with client-side rendering.** The conventional modern shape, and the
one that makes REQ-BOOK-008's "immediately" trivial. Rejected because the client
explicitly accepted a reload, so it buys nothing the requirements ask for, while
costing either a framework dependency (against REQ-BOOK-013) or hand-written DOM
code whose natural idiom — `innerHTML` — is a blocking finding on this project.

**A templating library.** Rejected as a dependency REQ-BOOK-013 would require a
reason for, when template literals and one escaping function do the same job.

**Serving `src/web/` as a static directory.** Rejected on security grounds above.
It would also be more code than the single route it replaces.

## Consequences

- The whole front end is testable without a browser or a DOM library: a function
  returns a string, and the tests assert on it.
- **What a string assertion cannot prove is layout.** REQ-BOOK-001's criterion 3
  (a multi-column grid) and criterion 8 (appearance) are not honestly closed by
  this approach, and no volume of passing tests should be read as closing them.
  They need a browser, and this ADR does not provide one.
- Any future interactivity — the Add Book modal in REQ-BOOK-005 — will need
  browser-side JavaScript, and this decision does not settle how that arrives.
  Expect a follow-up ADR at that slice, not an extension of this one.
- Escaping is a single point of failure by design. If `escapeHtml` is bypassed
  once, the protection is gone at that site, so new interpolations must go
  through it and review must check that they do.

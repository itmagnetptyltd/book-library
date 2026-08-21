# 2026-08-21 — Decomposition, the Library store, and the Home page

## Worked on

The whole project from a standing start: decomposed the client brief, resolved
the ambiguity register across two client replies, then built three slices.

REQ-BOOK-012 (the Library store), REQ-BOOK-011 (the application runs under
Node.js), REQ-BOOK-001 (the Home page Gallery). All three are `in_progress`
with `verified_by` set. The other eleven requirements are `agreed` and untouched.

## Learned

Everything durable from this session has been promoted — see below. Two things
that are not durable enough for their own record but cost time:

- The first client reply answered 21 of 25 questions and **deferred four back to
  the client themselves** ("should be confirmed with the client"), including one
  it half-answered: it gave Price's decimal places without naming the currency.
  Those are not independent — JPY carries no decimals — so no criterion was
  written from the half-answer, and the question stayed open until the second
  reply named BDT. Worth expecting the same shape next time a reply comes back
  from an intermediary rather than the client.
- `ANSWERS.md` carries no date or channel for either reply, so every `source:`
  in `book.yaml` cites the file and the date it was recorded rather than a
  message. Ask for a dated paste next time.

## Left unfinished

- **`.gitignore` line 41 breaks CI.** `**/.claude/itm-sdlc/**` excludes the whole
  toolkit from git, not just its `node_modules`. `git ls-files .claude/itm-sdlc`
  returns 0 files, but `.github/workflows/gates.yml` is tracked and expects the
  scripts to be there — the first CI run will fail with
  `::error::itm-sdlc not found at .claude/itm-sdlc`. This came from the install
  commit `1b7dcf8`, not from this session's work. One-line fix, left alone
  because it is installer-managed config and nobody has decided.
- **Two pull requests are open in draft form and must merge in order.**
  `book-library/record` (the requirements, ADRs and plans) before
  `book-library/store-and-home-page` (the code). `main` has no `book.yaml`, so
  merging the code first would leave all 16 `@covers` annotations naming
  requirements that do not exist, and G3 would report 16 orphans.
- **`book-library/initial-slices` on the remote is the pre-split branch**,
  carrying `.brain/` and code in one branch. Superseded by the two above, not
  deleted.
- **REQ-BOOK-001 cannot reach `verified` yet.** Criterion 3 (a multi-column grid)
  has only a CSS-string test, and criterion 8 (appearance) is untestable by
  construction. Both close at review with a browser.
- **REQ-BOOK-002 is the natural next slice** — the Book card currently shows the
  Name only, which is all REQ-BOOK-001 required. Two questions were raised in its
  plan and never answered: where the BDT marker goes (`৳350.00`, `BDT 350.00`,
  `350.00 BDT`), and whether the Book ID is visible text or a `data-` attribute.
- **No POST route exists**, so non-GET requests get 404 rather than 405. No
  criterion asks for either.

## Promoted to the record

- `constraints/development-machine-node-is-end-of-life.md`
- `constraints/windows-locks-open-sqlite-files.md`
- `rejected/better-sqlite3-at-latest-major.md`

ADR-0001 (the SQLite binding) and ADR-0002 (server-rendered HTML) were written
during the session itself and are on the `book-library/record` branch, not this
one.

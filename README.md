# Book Library

A local Book Library. The Home page shows every Book as a gallery of cards; you
can add a Book through a modal form and delete one after confirming.

Plain JavaScript on Node.js, server-rendered, **no build step and no browser
JavaScript**. One production dependency.

---

## Running it

```bash
npm install
npm start
```

It prints the address it is serving on — `http://127.0.0.1:3000` by default —
and serves only on the loopback interface, so it is not reachable from another
machine.

### What you need

- **Node.js.** `package.json` requires `>=20.17.0`, which is what this was built
  and tested on. Be aware that Node 20 reached end of life in April 2026, and the
  agreed delivery target (REQ-BOOK-011) is *a version in active or maintenance
  support at the date of delivery* — so the supported range is Node 22 and above.
  **The test suite has never been run on Node 22+.** See
  `.brain/constraints/development-machine-node-is-end-of-life.md`.
- **A prebuilt `better-sqlite3`, or a C++ toolchain.** It is a native module.
  `11.5.0` is used because it is the version with prebuilt binaries for Node 20
  on Windows x64; newer majors fall back to a `node-gyp` build that fails without
  Visual Studio Build Tools. See `.brain/decisions/ADR-0001-sqlite-binding.md`
  and `.brain/rejected/better-sqlite3-at-latest-major.md` before changing it.

Nothing else is required — no database server, no hosting, no configuration, no
environment variables, no sign-in.

## Checking it

```bash
npm test        # 91 tests
npm run coverage
npm run lint    # syntax check only; there is no linter dependency
```

## Where the Books live

A SQLite file at `src/data/library.db`, created on first use. It is data rather
than source, so it is git-ignored — delete it to start from an empty Library.

You can open it with any SQLite tool; the schema is `src/library/schema.sql`.

## Layout

Everything the application is made of lives under `src/`, served assets included.

```
src/
  server.js                     four routes over node:http
  config.js                     resolves the database file
  library/
    library-store.js            the only module holding SQL
    validate-book-details.js    checks a submitted Book before it is stored
    database.js                 opens the file, applies the schema
    schema.sql
  web/
    render-home-page.js         the document
    render-book-card.js         one Book card
    render-add-book-form.js     the Add Book modal
    render-delete-confirmation.js
    escape-html.js              the single escaping point
    home-page.css
tests/                          node:test, no test framework dependency
.brain/                         the project record — see below
```

### Routes

| | |
|---|---|
| `GET /` | the Home page |
| `GET /?add` | the Home page with the Add Book form open |
| `GET /?delete=<id>` | the Home page with a delete confirmation |
| `POST /books` | adds a Book. `303` to `/`, or `422` re-rendering the form with errors |
| `POST /books/delete` | deletes a Book. `303` to `/` |
| `GET /home-page.css` | the stylesheet |

Both modals take their visibility from the URL rather than from a script. The
Delete control is an anchor, so activating it opens a confirmation and cannot
itself delete anything.

## Why it is built this way

The reasoning lives in `.brain/`, not here. Read it before changing anything it
governs.

| | |
|---|---|
| `.brain/requirements/` | what was agreed, and the client's own words behind each criterion |
| `.brain/decisions/` | ADR-0001 the SQLite binding, ADR-0002 server-rendered HTML, ADR-0003 the URL-driven modals |
| `.brain/constraints/` | limits found in the wild, each with a review-by date |
| `.brain/rejected/` | approaches tried and abandoned, **with the reason** |
| `.brain/changes/` | scope variations and discovered constraints |

Two rules that are easy to break by accident:

- **Every value interpolated into HTML goes through `escapeHtml`.** A Book's Name
  is typed by a person. One bypass and the protection is gone at that site.
- **`PRICE_PATTERN` is duplicated in `library-store.js` and
  `validate-book-details.js` and the two must change together.** They are
  deliberately not yet consolidated; each carries a comment saying so.

## What it does not do

Recorded so that "not built" and "ruled out" stay distinguishable. Each was
raised with the client and answered on 2026-08-21.

- **No editing.** Add and delete only; a Book entered wrongly is deleted and
  added again.
- **No sign-in, no users, no roles.** Anyone using the local application can
  view, add and delete.
- **No pagination.** Every Book is shown.
- **No live updates between browser tabs.** A second tab reflects a change after
  it is reloaded.
- **Desktop browsers only.** Phones and tablets are out of scope.
- **Local only.** No hosting, domain or external service.

### Known limits

- **A Price may not exceed 999,999,999,999.99 BDT.** Above that it cannot be
  stored exactly, so it is refused rather than silently altered. The client has
  not agreed this limit — see `.brain/changes/CHG-0001.yaml`.
- All Prices are BDT. There is no currency choice.
- The Book card currently shows the Name only. The other four fields are
  REQ-BOOK-002 and are not built yet.

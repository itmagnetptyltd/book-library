# ADR-0001 — The Library uses better-sqlite3, pinned, rather than node:sqlite

- **Status:** accepted
- **Date:** 2026-08-21
- **Governs:** src/library/database.js, src/library/library-store.js, package.json

## Context

REQ-BOOK-012 requires the Library to be held in a SQLite file on the local
development PC. REQ-BOOK-013 requires the application to declare only the
dependencies it genuinely needs, each carrying a recorded reason. Those two pull
against each other, and which way they resolve depends entirely on the Node.js
version — which REQ-BOOK-011 fixes only as "in active or maintenance support at
the date of delivery".

At the date of this decision that range is Node 22 and above, because Node 20
reached end of life in April 2026. **Every version in that range ships
`node:sqlite`, so the correct answer for the delivery target is zero
dependencies.**

The development machine, however, runs **Node v20.17.0** — below the range and
past end of life. `require('node:sqlite')` on it fails with
`ERR_UNKNOWN_BUILTIN_MODULE`, verified rather than assumed. There is no version
manager installed and no second Node on the machine.

Building against `node:sqlite` would therefore mean delivering a slice that
cannot be run or tested on the only machine available, on the strength of an
argument about which Node version *ought* to be installed. Tests that have never
executed are not evidence.

## Decision

Use **`better-sqlite3`, pinned to `11.5.0`**, as the SQLite binding.

The version is pinned rather than floated because 11.5.0 is the version whose
prebuilt binaries match Node 20 on Windows x64. Newer majors fall back to a
`node-gyp` rebuild, which fails on this machine — there is no MSVC toolchain —
and that failure is what a floating range would reintroduce silently.

All SQLite access is confined to `src/library/database.js`, which is the only
module that imports the binding. `src/library/library-store.js` holds the SQL;
nothing above it knows the Library is SQLite at all.

**This is the recorded reason REQ-BOOK-013 requires for this dependency:**
`better-sqlite3` provides SQLite access, which REQ-BOOK-012 requires, on a Node
version that has no built-in SQLite. It is the only production dependency.

## Alternatives considered

**`node:sqlite`, built in, zero dependencies.** The better answer for the stated
delivery target and the one this ADR expects to be revisited for. Rejected now
only because it cannot run on the installed Node, so the slice could not be
tested. It also carries an unresolved detail: on Node 22.x it sits behind
`--experimental-sqlite`, and the flag requirement was dropped in a later major
whose exact number has not been confirmed here. That flag would have to appear in
the documented start command, so it is not a free swap.

**`better-sqlite3` on a floating range.** Rejected: the latest majors have no
Node 20 prebuild and fall back to a native build that fails here. This was not
theoretical — it is what happened on the first install attempt.

**A WASM-based SQLite driver.** Would avoid the native build without needing a
newer Node, but is a less-used package and still a dependency, so it loses to
`better-sqlite3` on maturity while beating it on nothing that matters here.

**Upgrading Node on the development machine.** Not this decision's to make.
Installing software on someone's machine is their call, and REQ-BOOK-011's
supported range is a client-facing question, not a local convenience.

## Consequences

- The application carries exactly one production dependency, and it is a native
  module. Anyone cloning this on a platform without a matching prebuild needs a
  build toolchain.
- The pin is deliberate and must not be "tidied up" to a caret range.
- **This ADR is expected to be superseded.** Once the delivery Node version is
  confirmed at 22.5 or above, `node:sqlite` removes the dependency entirely and
  satisfies REQ-BOOK-013 outright. The swap touches one file,
  `src/library/database.js`, by design — and needs the experimental-flag question
  answered first.
- Because the development machine is on an end-of-life Node, the suite passing
  here is not evidence that it passes on the delivery target. It has not been run
  on Node 22 or above.

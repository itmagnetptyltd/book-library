# On Windows an open SQLite handle locks the database file, so test cleanup must close before it deletes

- **Discovered:** 2026-08-21
- **Review by:** 2027-08-21
- **Source:** Measured while writing `tests/library/library-store.test.js`.
  Windows file-sharing semantics; not a SQLite or better-sqlite3 defect.
- **Affects:** tests/**, REQ-BOOK-012

## The constraint

A test that opens a Library over a temporary database file and registers its
cleanup with `t.after()` **cannot** delete that file while any handle to it is
still open. `fs.rmSync` fails:

```
EBUSY: resource busy or locked, unlink
'C:\Users\kartik\AppData\Local\Temp\book-library-test-0fhgrF\library.db'
```

The trap is the interaction with Node's test runner: **`t.after()` hooks run in
registration order, not reverse order.** A helper that creates a temp directory
and registers its removal first, and a test that opens a store and registers its
close second, will therefore attempt the delete *before* the close, and fail —
on Windows only. The same test passes on Linux and macOS, where an open file can
be unlinked.

This failed 5 of 6 tests on first run, all with `failureType: 'hookFailed'` —
the test bodies had already passed. That is what makes it worth recording: the
failure output points at cleanup, not at the behaviour under test, and reads as
if the tests are broken when they are not.

## How we know

Observed directly on 2026-08-21 running `npm test` on Windows 11 (10.0.26200)
with Node v20.17.0 and better-sqlite3 11.5.0. Reproduce by registering a
directory removal in a `t.after()` before opening a store over a file inside it.

## What we do about it

`aFreshDatabaseFile` in `tests/library/library-store.test.js` and
`aRunningLibrary` in `tests/helpers/library-server.js` both take ownership of
shutdown order. Each collects the handles a test opens and, in a single
`t.after()`, closes every one of them — tolerating a handle the test already
closed — before removing the directory.

**Any new test that opens a database file must use one of those helpers rather
than registering its own cleanup.** Registering a second `t.after()` that
deletes reintroduces the ordering bug.

A related instance of the same underlying fact, outside the tests: `npm start`
leaves the `node src/server.js` child running when the npm wrapper is killed,
and that orphaned process keeps `src/data/library.db` locked. `rm -rf src/data`
fails with the same `EBUSY` until the child is stopped.

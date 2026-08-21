# The development machine runs Node v20.17.0, which is past end of life and has no built-in SQLite

- **Discovered:** 2026-08-21
- **Review by:** 2026-11-21
- **Source:** `node --version` on the development machine returns `v20.17.0`.
  `require('node:sqlite')` on it fails with `ERR_UNKNOWN_BUILTIN_MODULE`,
  measured rather than assumed. Node 20 reached end of life in April 2026.
- **Affects:** src/library/database.js, package.json, ADR-0001, REQ-BOOK-011, REQ-BOOK-013

## The constraint

Three separate facts, all measured on 2026-08-21, which together decide how
SQLite is reached:

1. **Node is v20.17.0.** `node:sqlite` was added in Node 22.5 and does not exist
   here — `require('node:sqlite')` throws `ERR_UNKNOWN_BUILTIN_MODULE`.
2. **There is no version manager.** No `nvm`, `fnm` or `volta` is installed, and
   `C:\Program Files\nodejs` holds the only Node. Switching versions is a manual
   install, not a command.
3. **There is no C++ build toolchain.** `npm install better-sqlite3` (latest
   major) fell through to a `node-gyp` rebuild and failed:

   ```
   gyp ERR! System Windows_NT 10.0.26200
   gyp ERR! node -v v20.17.0
   gyp ERR! node-gyp -v v10.1.0
   gyp ERR! not ok
   ```

The consequence that matters: **REQ-BOOK-011 fixes the delivery target as "a
Node.js version in active or maintenance support at the date of delivery",
which as of today means Node 22 and above. The machine the code is written and
tested on is outside that range.** The test suite has never run on the version
the application is meant to ship on.

## How we know

Directly measured on 2026-08-21, on the machine in question:

- `node --version` → `v20.17.0`
- `node -e "require('node:sqlite')"` → `ERR_UNKNOWN_BUILTIN_MODULE`
- `ls ~/.nvm ; command -v nvm fnm volta` → nothing
- `npm install better-sqlite3` → the gyp failure quoted above

Re-measure the same four commands to check whether this still holds.

## What we do about it

`better-sqlite3` is pinned to `11.5.0` in `package.json` — the version whose
prebuilt binaries match Node 20 on Windows x64, so no compiler is needed. The
reasoning is ADR-0001; the abandoned alternative is
`rejected/better-sqlite3-at-latest-major.md`.

All SQLite access is confined to `src/library/database.js`, so if Node is
upgraded past 22.5 the swap to the built-in `node:sqlite` — which removes the
project's only production dependency and satisfies REQ-BOOK-013 outright —
touches one file.

**When reviewing this, check the version question that ADR-0001 left open:**
`node:sqlite` sits behind `--experimental-sqlite` on Node 22.x and the flag
requirement was dropped in a later major whose number has not been confirmed.
That flag would have to appear in the documented start command, so the swap is
not free.

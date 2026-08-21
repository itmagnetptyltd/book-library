# Install better-sqlite3 at its latest major, on a caret range

- **Tried:** 2026-08-21
- **By:** Kartik Chandra Biswas
- **Related:** ADR-0001, constraints/development-machine-node-is-end-of-life.md, REQ-BOOK-012, REQ-BOOK-013

## What was tried

The obvious first step for REQ-BOOK-012: `npm install better-sqlite3`, taking
whatever the latest major resolved to and letting `package.json` carry the
default caret range.

## Why it was abandoned

**It does not install on this machine.** No prebuilt binary matched Node 20 on
Windows x64, so npm fell through to compiling from source, and there is no MSVC
toolchain present:

```
npm error gyp ERR! System Windows_NT 10.0.26200
npm error gyp ERR! command "node.exe" "node-gyp.js" "rebuild" "--release"
npm error gyp ERR! cwd D:\projects\book-library\node_modules\better-sqlite3
npm error gyp ERR! node -v v20.17.0
npm error gyp ERR! node-gyp -v v10.1.0
npm error gyp ERR! not ok
```

`better-sqlite3@11.5.0` installed cleanly in 4 seconds from a prebuild, on the
same machine, with no other change. So the failure is specifically the newer
majors having dropped the Node 20 prebuild, not the package being unusable.

The caret range is the second half of the problem and the more dangerous one. A
`^` range would resolve to a newer major on any fresh `npm install` — including
on a colleague's machine or in CI — and reintroduce this failure silently, long
after anyone remembers why the version was chosen. **The pin in `package.json`
is load-bearing and must not be tidied into a range.**

## What would have to change for this to become viable

Either of these, independently:

- **The development machine moves to Node 22 or above.** Current majors ship
  prebuilds for supported Node versions, so the install would succeed. But at
  that point the better move is to drop the dependency altogether for the
  built-in `node:sqlite` — see ADR-0001 — which makes this approach viable and
  pointless at the same moment.
- **A C++ build toolchain is installed** (Visual Studio Build Tools). The source
  build would then succeed on Node 20. This removes the error without removing
  the reason: it makes every clone of the project require a compiler, which is a
  poor trade for an application whose brief asks it to be easy to run on a local
  development PC.

Neither is worth doing for its own sake. The pin costs nothing and the
constraint that forced it has a review-by date of 2026-11-21.

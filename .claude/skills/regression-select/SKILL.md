---
name: regression-select
description: Derive which test files are worth re-running for a change — a CHG- id, or one or more REQ- ids. Use before verifying a change, when the full suite is slow enough that scope matters. Reports only; does not change what G2/G4 actually run.
allowed-tools: Read, Grep, Glob, Bash
---

# regression-select

Runs `scripts/regression-select.js` and reports what it derives. **Read-only,
and reports only** — G2 and G4 still run the project's full adapter test
command regardless of what this prints. Nothing here is wired into the
gauntlet yet.

---

## 1. Find a runnable toolkit

Same seam as `/verifyReq`, `/metrics` and `/client-report`. If
`.claude/itm-sdlc/node_modules/` is missing, install once:

```bash
cd .claude/itm-sdlc && npm ci --omit=dev --no-audit --no-fund
```

Then return to the project root.

## 2. Run it

Give it exactly what changed — a change record, or the requirement(s) directly:

```bash
node .claude/itm-sdlc/scripts/regression-select.js CHG-0012
node .claude/itm-sdlc/scripts/regression-select.js REQ-SAMPLE-001 REQ-SAMPLE-004
```

Not both at once, and not more than one `CHG-` id — the script refuses either.

## 3. What it does

1. Resolves the input to a starting set of requirement ids. A `CHG-` id reads
   its `affects` field (whichever shape the record uses — see
   `templates/brain-scaffold/changes/README.md` and
   `skills/change-record/SKILL.md`, which currently document two different
   ones).
2. Walks `depends_on` **in reverse**: not what the starting requirement(s)
   depend on, but every requirement that depends on *them*, transitively.
   Those are the ones whose own behaviour may have assumed something that
   just changed.
3. Collects every test file carrying an `@covers` annotation for any id in
   that expanded set.
4. Prints the file list, and — purely informational — each detected
   adapter's test command as declared in `adapters/*.json`. That command runs
   the **whole** suite today; nothing scopes it to just these files yet.

## 4. Report

**Show the script's own output**, including the impacted-requirements list —
a developer who only sees the file list cannot tell whether a small change
pulled in half the requirement graph, and that is exactly the number worth
knowing before deciding whether to trust the scope.

State plainly:

- How many requirements were impacted, and how many were added purely via
  `depends_on` (not directly named).
- How many test files were derived. **An empty list is a real, reportable
  outcome, not a script failure** — it means nothing currently annotates any
  impacted requirement, which is itself useful to know.
- That this is advisory: the person still decides whether to run the full
  suite or trust the derived scope. Do not present the derived list as
  something G2/G4 already uses — they do not, on purpose (see Rules).

---

## Rules

- **Do not suggest running only the derived file list in CI, or editing
  `workflows/gates.yml`/adapter test commands to do so.** G2 and G4 are not
  pointed at this selection until it has been proven non-empty and correct
  against real fixtures, repeatedly, over time — a single run in one project
  is not that proof.
- **A `CHG-` id that names no affected requirement, or that cannot be found,
  is a failure to report, not a reason to guess.** Say so and stop; do not
  fall back to "select everything" silently.
- **Read-only.** No edits to `.brain/`, no requirement changes, and this
  skill never itself runs the derived tests — it only says what they are.

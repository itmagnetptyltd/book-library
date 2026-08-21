---
name: verifyReq
description: Verify the requirement record — schema, ids, dependencies, statuses and traceability — against the working tree. Use before committing, before opening a pull request, and after any skill that writes to .brain/requirements/.
allowed-tools: Read, Grep, Glob, Bash
---

# verifyReq

Checks that the **requirement record** is sound and that the code matches it.

Nothing here is new logic. These are the exact scripts the pull request gauntlet
runs — running them locally only changes *when* you find out.

The name is deliberately narrow. This verifies requirements; other things worth
verifying get their own command rather than being quietly bolted on here.

---

## 1. Find a runnable toolkit

The installer vendors the scripts into `.claude/itm-sdlc/`, but **not their
dependencies** — `node_modules/` is gitignored, so a fresh clone of the project
has the scripts and nothing to run them with.

Check for `.claude/itm-sdlc/node_modules/`. If it is missing, install once:

```bash
cd .claude/itm-sdlc && npm ci --omit=dev --no-audit --no-fund
```

Then return to the project root before step 2.

**Do not use `npm --prefix`.** It does not read `package.json` from the prefix —
it reads it from the current directory — so it fails with `enoent` here. The
working directory has to actually be `.claude/itm-sdlc`. This is the same trap
that produced `setup.js` for the toolkit clone.

`npm ci` rather than `npm install`, because the lockfile ships with the payload
and a project's check should not silently drift to different dependency
versions. Safe to repeat; the result is already gitignored.

**Never fall back to a toolkit clone at an absolute path.** `C:\itm-sdlc` exists
on one machine. A check that only the person who set the project up can run is
not a check.

## 2. Verify the record

Both, from the project root. Do not stop at the first failure — the developer
wants the whole picture, not the first line of it.

```bash
node .claude/itm-sdlc/scripts/validate-requirements.js --cwd .
node .claude/itm-sdlc/scripts/check-traceability.js --project .
```

| Check | Answers |
|---|---|
| `validate-requirements` | Is the record internally consistent — ids unique, dependencies real, no cycles, nothing `agreed` with open ambiguities, nothing `verified` without `verified_by`? |
| `check-traceability` | Orphans in both directions — an `agreed` requirement with no code claiming it, and an annotation naming a requirement or a version that does not exist. |

## 3. Also run, until they have their own command

These are **not** requirement checks. They inspect the whole working tree, and a
credential or an expired constraint can appear in any change regardless of which
requirement it belongs to. They are run here because there is nowhere better yet
— when a `/verifyTree` or equivalent exists, they move there.

```bash
node .claude/itm-sdlc/scripts/check-secrets.js --project .
node .claude/itm-sdlc/scripts/check-constraints.js --project .
```

Report them under a separate heading. Do not let them dilute the requirement
verdict in either direction — a clean record with a hardcoded password is not a
pass, and an expired constraint does not make the requirements wrong.

## 4. Change drift

Also not a requirement check, and given its own heading rather than folded
into step 3 — this one reads the requirement record too, and the point is
exactly to keep it from being mistaken for part of the traceability verdict:

```bash
node .claude/itm-sdlc/scripts/check-drift.js --project .
```

Reports three things: `@covers` annotations pinned to a version that is no
longer current (cited from `check-traceability`'s own class C, not
recomputed — the two must never be free to disagree), requirement versions
that incremented with no `CHG-NNNN` anywhere in their history, and `agreed`
requirements with no implementation annotation at all that traceability's own
`in_progress` floor does not already report. Advisory, always exits 0 unless
run with `--strict`.

## 5. Report

**Show the scripts' own output.** Do not paraphrase a count, do not summarise a
verdict, do not say "all clean" without the lines that say so. Report each
check's exit code.

Then state, in one line each:

- what failed, and what the developer should do about it
- what passed
- anything **advisory** — `check-secrets`, `check-constraints` and
  `check-drift` all ship advisory, so they can report findings and still exit
  0. An advisory finding is still a finding. Say it out loud rather than
  letting a green exit code bury it.

If everything passes, say so plainly and add the one caveat that matters: a
clean secret scan is evidence, not proof.

---

## Rules

- **Read-only.** This skill runs checks and reports. It does not fix what it
  finds, does not edit requirements, and does not touch `.brain/`. Fixing a
  finding is the developer's decision, and some of them are change records
  rather than edits.
- **Never lower a threshold to get a pass.** If a check is wrong, that is a
  pilot finding, not an argument for editing the check.
- **Report a script that could not run as a failure**, never as a pass. A
  missing module, a bad path or a crash means you learned nothing — which is not
  the same as learning that nothing is wrong.

## Then what

**Do not give the same next step regardless of what you found.** Read the state
before recommending anything.

- **Failures in the record** → fix them, or open a `/change-record` if the record
  is right and the world changed.
- **Traceability orphans** → the annotation is missing, or points at a version
  that no longer exists. `/feature-plan` shows which requirement the work
  belongs to.
- **Change drift** → a version bump with no `CHG-NNNN` behind it means scope
  moved without a record; open `/change-record` for it, retroactively if
  necessary. A stale `@covers` needs the test re-read against the current
  text before its pin moves. A missing annotation on an `agreed` requirement
  means work has not started — `/feature-plan` it, or say plainly that it is
  still waiting.
- **Green, and the change under review is code** → `/pr-prepare`.
- **Green, but nothing is built yet** — no adapter detected, no test files
  scanned, `src/` effectively empty → **not** `/pr-prepare`. There is nothing to
  raise a pull request about. The next step is `/feature-plan <REQ-ID>` on an
  `agreed` requirement, and building it.
- **Requirements still at `draft`** → say which, and which questions are holding
  them. They cannot be planned or built. If the rest are `agreed`, work can
  start on those in parallel while the client answers — say so, rather than
  implying the whole project is blocked.

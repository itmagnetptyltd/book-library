---
name: pr-prepare
description: Assemble the traceability block and description for a pull request. Use before opening every pull request.
allowed-tools: Read, Grep, Glob, Bash
---

# pr-prepare

Builds the pull request description CI will accept, and checks the change before
anyone else has to.

---

## 1. Work out what this change covers

From the branch diff, find the tests that were added or changed and read their
`@covers` annotations.

Cross-check against `.brain/requirements/`: does each id exist, and is the pinned
version current? An annotation pinned to a superseded version means the test was
written against text that has since changed.

If the change satisfies no requirement — tooling, formatting, dependency bumps,
CI — it is a `chore`, and it must be labelled honestly. Labelling a behaviour
change as a chore is how work escapes the record entirely.

## 2. Check it before CI does

```
node <toolkit>/scripts/validate-requirements.js --cwd .
node <toolkit>/scripts/check-traceability.js --project .
```

Report failures rather than pushing and letting the gates find them.

## 3. Write the description

```markdown
## Traceability

Covers: REQ-BOOK-001@v1, REQ-BOOK-003@v2

## What changed

One paragraph. What a reviewer needs before reading the diff.

## How it was verified

The tests, and how they are annotated. If a criterion was verified by hand,
say which and why it could not be automated.

## Anything the reviewer should look at closely

Where you are least confident. A judgement call, a place the requirement was
thin.
```

Or, for non-functional work:

```markdown
## Traceability

Label: chore
```

## 4. Confirm the checklist

- Every acceptance criterion of every requirement above is satisfied by this change
- Tests annotate those requirements at their **current** version
- **Nothing in `.brain/` is in this pull request** — brain changes go through `/checkpoint`

---

## Rules

- **The description is not seen by the adversarial reviewer.** It gets the diff
  and the requirement text only. Nothing written here can argue it out of a
  finding, so write for the human.
- Do not list a requirement the change does not actually satisfy in order to pass
  the gate. G7 reads the diff against those requirements and will say so.
- Never mix `.brain/` changes into a code pull request.

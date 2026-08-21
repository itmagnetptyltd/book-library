# Glossary

Terms are **fixed** on this project. Use these words, spelled this way, and no
synonyms — in requirements, in code, in tests, in conversation with the client.

A term used in a requirement but not defined here is an **ambiguity**, not a
decision anyone may make on the client's behalf. Record it and ask.

---

## How to write an entry

**Term** — what it means here, in one sentence. Then, where it matters:
- **Not to be confused with:** the near-synonym people reach for, and how it differs
- **Also called:** what the client says, when it differs from the agreed term
- **Identified by:** what makes two of these the same one

---

## Agreed terms

**Book** — one entry in the Library, carrying a Book ID, a Name, an Author, a
Language and a Price.
- **Identified by:** its Book ID.

**Library** — the complete set of Books the application holds.
- **Also called:** the client writes "the library" in lower case. Same thing.

**Book ID** — the identifier the **application issues** to a Book when it is
added. It is never entered by a person, is unique across the Library, and is
never reused once its Book is deleted.
- **Source:** client answers, ANSWERS.md, 2026-08-21.

**Name** — the Book's title field, as the client named it. The word "Title" does
not appear in this project's code, requirements or interface.

**Author** — the Book field naming who wrote it. A single free-text field.

**Language** — the Book field naming the language it is written in. **Free
text**, entered by the person adding the Book. There is no fixed list.
- **Source:** client answers, ANSWERS.md, 2026-08-21.

**Price** — the Book field naming what it costs, held as a number and always in
**BDT (Bangladeshi Taka)**, displayed with **two decimal places**. There is no
per-Book currency, and no currency is chosen when a Book is added.
- **Source:** client answers, ANSWERS.md, 2026-08-21.

**Book card** — the visual representation of one Book in the Gallery.

**Gallery** — the grid of Book cards shown on the Home page.
- **Also called:** the client writes "gallery/grid layout". One thing, one word.

**Home page** — the single page the application opens on, carrying the Gallery
and the "+ Add Book" control.

**Add Book form** — the modal form opened by the "+ Add Book" control, in which a
person enters a new Book's Name, Author, Language and Price. It has no Book ID
control and no currency control.

**Delete** — **permanent removal** of a Book from the Library, confirmed by the
person first. A deleted Book is not archived, not hidden and not recoverable, and
does not return after a restart.
- **Not to be confused with:** archival. There is no archive on this project.
- **Source:** client answers, ANSWERS.md, 2026-08-21.

---

## Deliberately out of scope

Recorded so that "it was never mentioned" and "it was ruled out" stay
distinguishable. Each was raised as an ambiguity and closed by the client on
2026-08-21.

- **Editing a Book.** Add and Delete only. A Book entered wrongly is deleted and
  added again.
- **Sign-in, users and roles.** No authentication. Anyone using the local
  application may view, add and delete.
- **Pagination.** Every Book is shown on the Home page, however many there are.
- **Live synchronisation between browser tabs.** A second tab reflects a change
  after it is reloaded, not before.
- **Phone and tablet layouts.** A desktop browser on the local development PC is
  the only target.
- **Deployment beyond the local development PC.** No hosting, domain or external
  service.
- **A brand, colour scheme, reference site or font.** None is specified, and a
  plain tidy layout is acceptable.

---

## Appears in source documents, not yet defined

All 25 terms raised at the first decomposition were settled on 2026-08-21. The
six below arrive with the second brief of 2026-08-21 (`BRIEF.md`) and are **not
defined by anyone yet**. Each has a matching question in `AMBIGUITIES.md`.

- **Cover / Cover Photo** — an image associated with a Book. Whether it is part
  of a Book, how many there may be, whether one is required, and what happens to
  a Book that has none, are all unstated.
- **Edit** — changing a stored Book's details. Directly contradicts the agreed
  meaning of the Library today, in which a Book is deleted and added again; see
  the entry for **Delete** above and `CHG-0004`.
- **Search / Filter** — finding a subset of the Library. Whether these are one
  feature or two, and what "search by title" means when the field is called
  **Name**, is unstated.
- **Dark mode / Light mode** — a display preference. Who chooses it, and whether
  the choice is remembered, is unstated.
- **Loading state** — feedback shown while an operation is in flight. Not
  defined against any duration or threshold.
- **Toast / Snackbar** — a transient message. Its duration, position and
  dismissal behaviour are unstated, and the term is a UI-library convention
  rather than a domain term.

**None of these is agreed scope.** Every one arrived in a report whose asks are
recorded as open change records (`CHG-0002` … `CHG-0012`) with blank `decision`
and `commercial` fields.

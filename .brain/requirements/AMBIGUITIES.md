# Ambiguities — Book Library

Open questions arising from the client brief (Client brief, ITMagnet - Test,
email 2026-08-19, quoted verbatim in `.brain/requirements/BRIEF.md`).

Each heading is a question for the client, and appears word for word in the
`ambiguities` list of every requirement it affects in `book.yaml`. The two files
are one list seen twice. **None of these may be closed by anyone choosing a
reading** — only the client's answer closes one.

**One open question.** All 25 raised at decomposition were answered by the client
on 2026-08-21, in two replies; their answers became acceptance criteria in
`book.yaml` and their wording is kept in `ANSWERS.md`. The question below was
raised afterwards, and not by the client — CHG-0001 records a limit reality
imposed on REQ-BOOK-007, which is now at v2 and back to `draft`.

---

## What is the largest Price a Book may carry?

- **Affects:** REQ-BOOK-007 (v2)
- **Raised by:** CHG-0001, 2026-08-21. Not a question the client's words raised —
  a limit reality imposed, found in code review.
- **The document says:** "with each book card showing the Book ID, Name, Author,
  Language, and Price" (Client brief, ITMagnet - Test, email 2026-08-19), and the
  client's answer of 2026-08-21: "All prices are in one currency: BDT
  (Bangladeshi Taka). Price should always be displayed with two decimal places."
  Neither states a maximum.
- **Which could mean:**
  - (a) There is no meaningful maximum, and the cap now in the code —
    999,999,999,999.99 BDT — is simply beyond anything a Book will cost.
  - (b) There is a maximum, but a different one the client would rather name.
  - (c) A Price must be stored exactly whatever its size, and no cap is
    acceptable.
- **Question for the client:** Is there any Book whose Price could exceed
  999,999,999,999.99 BDT — and if so, what is the largest Price you need us to
  handle?
- **Why it matters:** REQ-BOOK-007 v1 promised the Library returns a Book
  "carrying exactly those entered details", with no limit. Measured, that was
  false: a Price above the safe-integer boundary was stored and read back as a
  different number, silently. The application now refuses such a Price instead,
  which is honest but introduces a limit nobody agreed. Under (c) the storage
  itself changes — `price_minor` stops being a JavaScript number — which
  reopens REQ-BOOK-012 and needs a data migration. Under (a) or (b) it is a
  wording change to one criterion.

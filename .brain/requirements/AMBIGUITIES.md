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

---

# Second brief, 2026-08-21 — questions arising

Everything below arises from the **second** source brief in `BRIEF.md`
(`# Source brief — 2026-08-21`), an unattributed written report addressed
"To: Development Team". Nothing in it is agreed scope: the same text is `FB-0001`
and its asks are `CHG-0002` … `CHG-0012`, every one with a blank `decision` and a
blank `commercial` field.

The register below is in three parts.

1. **Questions attached to the new draft requirements** REQ-BOOK-015 …
   REQ-BOOK-032. Each of these appears word for word in the `ambiguities` list of
   the requirements named under **Affects**.
2. **Questions against requirements that are already `agreed`.** These are *not*
   carried in any requirement's `ambiguities` list, because adding an open
   ambiguity to an `agreed` requirement would reopen it — and reopening an agreed
   requirement is a change record and a client decision, not something a
   decomposition may do on its own. They are recorded here, and here only, until
   the client answers them.
3. **Questions about the document itself.**

Quotations are taken verbatim from `BRIEF.md`. The reviewer's tables arrived as
tab-separated text; where a table row is quoted, the tab is shown as an em dash
so the row reads, and the words are otherwise unchanged.

---

# Part 1 — questions attached to the new draft requirements

---

## Is a Cover Photo part of a Book, or a separate thing the Library holds?

- **Affects:** REQ-BOOK-015, REQ-BOOK-017, REQ-BOOK-018, REQ-BOOK-019
- **The document says:** "Cover Photo Upload — No field or preview for book
  covers. This is essential for visual appeal. — 🔴 High" (Second brief,
  unattributed reviewer, 2026-08-21, Critical Missing Features)
- **Which could mean:**
  - (a) A Cover Photo is a sixth field of a Book, alongside Book ID, Name,
    Author, Language and Price, and lives and dies with its Book.
  - (b) A Cover Photo is a separate stored thing — a file, or a row in its own
    table — that a Book points at, and which could in principle be shared,
    orphaned or replaced independently.
- **Question for the client:** Is a book cover simply one more detail of a book,
  or a separate item in its own right that a book refers to?
- **Why it matters:** The glossary fixes **Book** as "one entry in the Library,
  carrying a Book ID, a Name, an Author, a Language and a Price" — five fields,
  no image. Under (a) the glossary entry changes and the store gains a column.
  Under (b) there is a second table, a second lifecycle, its own delete rules and
  its own URL surface, and REQ-BOOK-012's "the Library is held in a SQLite
  database file" criterion has to say what it now covers. (b) cannot be reduced
  to (a) later without rewriting stored data.

---

## May a Book be added without a Cover Photo?

- **Affects:** REQ-BOOK-015, REQ-BOOK-018, REQ-BOOK-020
- **The document says:** "Display cover on each book card (fallback if none)."
  (Second brief, unattributed reviewer, 2026-08-21, Recommended Improvements
  item 1) — and, in the same document, "Cover photo upload + preview in Add
  form." (Acceptance Criteria)
- **Which could mean:**
  - (a) A Cover Photo is optional. "Fallback if none" exists precisely because a
    Book may have none, and the Add Book form accepts a submission without one.
  - (b) A Cover Photo is required from now on, and the fallback covers only the
    Books already in the Library from before the change.
- **Question for the client:** Can a book be added without a cover photo, or must
  every new book have one?
- **Why it matters:** Under (b) the Add Book form gains a sixth mandatory field
  and REQ-BOOK-006 needs a new refusal criterion, which changes what a valid
  submission is. It also decides whether REQ-BOOK-020's fallback is a permanent
  behaviour or a one-off migration measure — and therefore whether it is worth
  building at all.

---

## How many Cover Photos may one Book carry?

- **Affects:** REQ-BOOK-015, REQ-BOOK-018, REQ-BOOK-019, REQ-BOOK-021
- **The document says:** "Book cards must show cover images (thumbnail + full
  view option)." (Second brief, unattributed reviewer, 2026-08-21, Critical
  Missing Features, Cover Display). The word "images" is plural; the word "cover"
  is singular.
- **Which could mean:**
  - (a) One Cover Photo per Book. "Cover images" is the plural across all the
    Books, not several per Book, and "thumbnail + full view" is one image shown
    at two sizes.
  - (b) Several images per Book — front cover, back cover, sample pages — of
    which one is shown on the card.
- **Question for the client:** Does a book have exactly one cover photo, or can it
  have several?
- **Why it matters:** (a) is a single column or a single file reference. (b) is a
  one-to-many relationship, an ordering rule, a "which one is the card image"
  rule, and a gallery control inside the full view. Moving from (a) to (b) later
  is a schema migration; the two are not the same feature at a different size.

---

## What is the largest Cover Photo file the application must accept?

- **Affects:** REQ-BOOK-015, REQ-BOOK-016, REQ-BOOK-018
- **The document says:** "Add an input[type="file"] in the Add Book form. Accept
  .jpg, .png, .webp." (Second brief, unattributed reviewer, 2026-08-21,
  Recommended Improvements item 1). No size is named anywhere in the document.
- **Which could mean:**
  - (a) Any file the person can choose, however large — a 40 MB scan included.
  - (b) A sensible cap the client would name if asked, above which the form
    refuses the file.
- **Question for the client:** What is the largest cover photo file we should
  accept — and what should happen when someone picks a bigger one?
- **Why it matters:** This is the same class of problem as CHG-0001 and the Price
  cap. Unbounded uploads into a SQLite file on a local development PC will make
  the store slow and eventually unusable, and the failure will look like a bug
  rather than a limit. A cap chosen by us rather than the client is a guess
  everyone later has to live with, and it cannot be raised without re-testing the
  store.

---

## Are the High, Medium and Low markings in the second brief the client's own priorities?

- **Affects:** REQ-BOOK-015 … REQ-BOOK-032 (every requirement drawn from the
  second brief)
- **The document says:** "Issue	Description	Priority" followed by rows marked
  "🔴 High", "🟡 Medium" and "🟢 Low" (Second brief, unattributed reviewer,
  2026-08-21, Critical Missing Features and Design & UI Issues).
- **Which could mean:**
  - (a) They are the client's priorities and bind: everything marked 🔴 High is a
    `must`.
  - (b) They are one reviewer's opinion of what a modern application ought to
    have, and the client's own priorities are different or not yet formed. The
    document itself says of dark mode "Not required but expected in modern apps",
    which reads as the reviewer's expectation rather than the client's need.
- **Question for the client:** Are these High / Medium / Low markings yours, and
  do you want them treated as the priority order for the next version?
- **Why it matters:** `priority` on every requirement REQ-BOOK-015 …
  REQ-BOOK-032 was set by mapping these markings (High → `must`, Medium →
  `should`, Low → `could`), because the schema requires a value and inventing one
  would have been worse. If the markings are not the client's, every one of those
  values is wrong, and so is any plan or estimate built on them.

---

## Is a Cover Photo file refused on its extension, on its content, or on both?

- **Affects:** REQ-BOOK-016
- **The document says:** "Accept .jpg, .png, .webp." (Second brief, unattributed
  reviewer, 2026-08-21, Recommended Improvements item 1)
- **Which could mean:**
  - (a) The file name's extension decides. A file named `cover.jpg` is accepted
    whatever is inside it.
  - (b) The file's actual content decides, and a renamed executable called
    `cover.jpg` is refused.
- **Question for the client:** Should we check the file name, or actually look
  inside the file to confirm it is really an image?
- **Why it matters:** (a) is one line of code and lets anything at all into the
  store under an image's name — which then gets served back to a browser. (b)
  needs content sniffing, and shifts what "accept .jpg" means in the acceptance
  criteria. On a local-only application the risk is small; the moment the
  application is served anywhere else it is not, and REQ-BOOK-011 already fixes
  it as local-only, so this is a question about how long that stays true.

---

## What should a person see when a chosen Cover Photo file is refused?

- **Affects:** REQ-BOOK-016
- **The document says:** "Accept .jpg, .png, .webp." (Second brief, unattributed
  reviewer, 2026-08-21, Recommended Improvements item 1). The document says
  nothing about the refusal.
- **Which could mean:**
  - (a) The file-choosing control simply does not offer the file, and the person
    is never told anything.
  - (b) The form shows a message naming what is wrong, in the same way
    REQ-BOOK-007 already requires for a refused Price.
  - (c) The whole submission is refused when the form is submitted, rather than
    when the file is chosen.
- **Question for the client:** When someone picks a file we cannot accept, should
  we tell them why — and at the moment they pick it, or when they press Add?
- **Why it matters:** (a) and (b) are different acceptance criteria and different
  tests. (b) is consistent with the treatment REQ-BOOK-007 already gives a bad
  Price; (a) is not, and would make the form behave two ways for two kinds of bad
  input. (c) changes REQ-BOOK-016's criteria from choose-time to submit-time.

---

## Does clearing the Add Book form after a successful add also clear the chosen Cover Photo and its preview?

- **Affects:** REQ-BOOK-017, REQ-BOOK-031
- **The document says:** "Clear form after successful add." (Second brief,
  unattributed reviewer, 2026-08-21, Recommended Improvements item 5), and "Show
  a preview thumbnail before submitting." (same document, item 1)
- **Which could mean:**
  - (a) "Form" means every control including the file control, so the preview
    disappears too and the next Book starts blank.
  - (b) "Form" means the text fields the person typed, and the chosen file stays —
    which would be convenient for someone adding several editions of one Book,
    and dangerous for someone who forgets it is still there.
- **Question for the client:** After a book is added, should the cover photo you
  picked be cleared along with the typed fields, or stay ready for the next one?
- **Why it matters:** Under (b) a person can add a second Book and silently give
  it the first Book's cover — a data error nobody notices until they look at the
  Gallery. Under (a) someone adding five volumes of one series re-picks the same
  file five times. These are opposite behaviours and only one set of tests can be
  written.

---

## Where is a Cover Photo held, and does it stay on the local development PC?

- **Affects:** REQ-BOOK-018
- **The document says:** "Implement localStorage for persistence (minimum). Or
  connect to a mock API (JSON Server, Firebase, etc.)." (Second brief,
  unattributed reviewer, 2026-08-21, Recommended Improvements item 4)
- **Which could mean:**
  - (a) The Cover Photo goes into the same SQLite database file REQ-BOOK-012
    already requires, held with the application on the local development PC.
  - (b) The Cover Photo goes on disk beside the database, and the database holds
    only a path to it.
  - (c) The Cover Photo goes to an external service — the document names Firebase
    — which is outside the local development PC entirely.
- **Question for the client:** Should cover photos be kept on the same PC as the
  rest of the library, in the same file, or somewhere else?
- **Why it matters:** (c) contradicts two agreed criteria at once: REQ-BOOK-011
  requires that "no hosting, domain or external service outside the local
  development PC is required", and REQ-BOOK-012 requires that "the Library is held
  on the local development PC, not in an external or hosted service". It also adds
  an account, a credential and a running cost to a project whose brief said "avoid
  unnecessary dependencies". (a) and (b) differ in backup, in file size limits and
  in what "delete the Book" has to clean up.

---

## When a Book is deleted, is its Cover Photo deleted too?

- **Affects:** REQ-BOOK-018
- **The document says:** "Each book should have a Delete button to remove it from
  the library" (Client brief, ITMagnet - Test, email 2026-08-19) and "Delete:
  Trash icon with confirmation modal." (Second brief, unattributed reviewer,
  2026-08-21, Recommended Improvements item 3). Neither document mentions the
  cover.
- **Which could mean:**
  - (a) The Cover Photo is removed with the Book, permanently and irrecoverably,
    exactly as the glossary defines **Delete**.
  - (b) The Cover Photo file survives the Book that referenced it.
- **Question for the client:** When a book is deleted, should its cover photo be
  destroyed as well?
- **Why it matters:** The glossary is explicit that Delete is "permanent removal
  … not archived, not hidden and not recoverable". If the image outlives the Book,
  that sentence stops being true, and an image someone believed they had deleted
  is still on disk — which matters if a cover was uploaded by mistake. Under (b)
  something has to clean up orphans, or the store grows without limit. This
  question only has an answer once "Is a Cover Photo part of a Book…?" above is
  answered.

---

## May a Book's Cover Photo be changed after that Book has been added?

- **Affects:** REQ-BOOK-018, REQ-BOOK-019
- **The document says:** "Update: Edit button on each card → pre-filled modal."
  (Second brief, unattributed reviewer, 2026-08-21, Recommended Improvements
  item 3), and "Cover photo upload + preview in Add form." (same document,
  Acceptance Criteria) — the second places cover upload in the **Add** form only.
- **Which could mean:**
  - (a) A cover can only ever be set when the Book is added. A Book with the wrong
    cover is deleted and added again, exactly as the client's answer of 2026-08-21
    says for every other field.
  - (b) A cover can be replaced on an existing Book — which is an edit, whatever
    it is called.
- **Question for the client:** If a book ends up with the wrong cover, should it be
  replaced in place, or should the book be deleted and added again?
- **Why it matters:** (b) contradicts two agreed criteria: REQ-BOOK-007's last
  criterion requires that "no control for changing that Book's details is
  present", and REQ-BOOK-012's last criterion requires that "no operation is
  offered that changes an existing Book's stored details". If a cover is part of a
  Book, replacing it is precisely the operation those two criteria forbid. This is
  the Edit question arriving through a side door, and answering it "yes" without
  noticing would break sixteen tests (CHG-0004).

---

## Must a Book card still show all five Book fields unclipped once a Cover Photo is added to it?

- **Affects:** REQ-BOOK-019
- **The document says:** "Book cards must show cover images (thumbnail + full view
  option)." (Second brief, unattributed reviewer, 2026-08-21, Critical Missing
  Features, Cover Display)
- **Which could mean:**
  - (a) The card gains an image and keeps all five fields visible, so the card
    grows or the fields shrink.
  - (b) The image takes the place of some of the text — the card becomes a cover
    with a Name under it, and the Book ID, Language and Price move to the full
    view or disappear.
- **Question for the client:** With a cover image on the card, do you still want
  the Book ID, Name, Author, Language and Price all visible on the card itself?
- **Why it matters:** REQ-BOOK-014's third criterion requires that a Book card
  "shows all five of its fields without any of them being clipped out of view", at
  any width the window supports. REQ-BOOK-002 requires each of the five
  individually. Under (b) both requirements change and their tests are invalidated.
  Under (a) the card layout has to be designed around the tightest window width,
  which is a real constraint on the visual work, not a detail.

---

## What should a Book card show in place of a Cover Photo when its Book has none?

- **Affects:** REQ-BOOK-020
- **The document says:** "Display cover on each book card (fallback if none)."
  (Second brief, unattributed reviewer, 2026-08-21, Recommended Improvements
  item 1). The word "fallback" is the whole of the specification.
- **Which could mean:**
  - (a) A single generic placeholder image, the same for every Book.
  - (b) A blank space of the same size, so the Gallery grid stays even.
  - (c) Something generated from the Book — its Name on a coloured tile, say.
- **Question for the client:** For a book with no cover, what would you like the
  card to show?
- **Why it matters:** (c) is a feature with its own rules — which colour, what
  happens to a very long Name, what happens in dark mode — and is not the same
  piece of work as (a) or (b). (a) needs an asset somebody has to supply or licence,
  and the second brief attached no reference designs. Choosing for the client here
  is choosing what their product looks like.

---

## What does opening a Cover Photo at "full view" mean?

- **Affects:** REQ-BOOK-021
- **The document says:** "Book cards must show cover images (thumbnail + full view
  option)." (Second brief, unattributed reviewer, 2026-08-21, Critical Missing
  Features, Cover Display)
- **Which could mean:**
  - (a) A larger version of the image opens over the Home page, in the same way
    the Add Book form does.
  - (b) The image opens in its own browser tab at its original size.
  - (c) The card itself expands in place within the Gallery.
- **Question for the client:** When someone clicks a cover, what should happen —
  a larger picture over the page, a new tab, or the card opening out?
- **Why it matters:** (a) needs a second modal, an overlay, a dismiss control and
  a decision about what happens to the Add Book form's modal if both could be
  open. (b) needs almost nothing but leaves the application. (c) reflows the
  Gallery and interacts with REQ-BOOK-014's no-horizontal-scrolling criterion.
  Three different pieces of work behind four words.

---

## Are Search and Filter one feature or two?

- **Affects:** REQ-BOOK-022, REQ-BOOK-023
- **The document says:** "No Search/Filter — As library grows, search by
  title/author/language becomes essential. — 🟢 Low" (Second brief, unattributed
  reviewer, 2026-08-21, Usability & Interaction Feedback)
- **Which could mean:**
  - (a) One thing: a single box you type into, which narrows the Gallery. "Search"
    and "filter" are two words for it.
  - (b) Two things: free-text search over the Books, *and* separate controls that
    restrict the Gallery to a chosen Language or a chosen Author.
- **Question for the client:** Do you want one search box, or a search box plus
  separate controls to narrow the list by author or language?
- **Why it matters:** (b) is several times the work of (a) and needs its own
  answers — do filters combine, what happens when a filter and a search term
  disagree, are the choices remembered. It also needs a list of Languages to
  filter by, and the client has already confirmed Language is free text with "no
  fixed list", so under (b) that list has to be derived from the Books present and
  changes as Books are added and deleted. REQ-BOOK-022 and REQ-BOOK-023 as drafted
  describe (a) only.

---

## What does "search by title" mean, when the Book field is called Name?

- **Affects:** REQ-BOOK-022, REQ-BOOK-023
- **The document says:** "As library grows, search by title/author/language
  becomes essential." (Second brief, unattributed reviewer, 2026-08-21, Usability
  & Interaction Feedback)
- **Which could mean:**
  - (a) "Title" is this reviewer's word for the field the client calls **Name**,
    and they are the same field.
  - (b) There is a Title that is not the Name — a series title, a subtitle, an
    original-language title — which the Library does not currently hold.
- **Question for the client:** When this says "search by title", does it mean the
  book's Name — the field you named — or something else the library does not store
  yet?
- **Why it matters:** The glossary is deliberate about this: "**Name** — the
  Book's title field, as the client named it. The word 'Title' does not appear in
  this project's code, requirements or interface." If (b), a Book gains a field and
  every requirement listing the Book's fields changes. If (a), the glossary holds
  and the word "title" never enters the code. Getting this wrong produces a search
  box that searches a field nobody meant.

---

## Which Book fields must a search term match, and must it match a whole value or part of one?

- **Affects:** REQ-BOOK-023
- **The document says:** "search by title/author/language" (Second brief,
  unattributed reviewer, 2026-08-21, Usability & Interaction Feedback)
- **Which could mean:**
  - (a) The term is matched against Name, Author and Language only — not Book ID,
    not Price — and matches any part of a value, ignoring case.
  - (b) The term must match a whole value exactly, so typing "Tagore" finds
    nothing when the Author is "Rabindranath Tagore".
  - (c) Book ID is searchable too, since it is the thing that identifies a Book.
- **Question for the client:** Should typing part of a word find a book, and should
  someone be able to search by Book ID as well?
- **Why it matters:** (b) makes the feature nearly useless in practice, and (a)
  makes it useful — but they are indistinguishable from the sentence written, and
  a test can only be written for one of them. Whether Book ID is included changes
  what the box is for: identifying one known Book versus browsing. Case sensitivity
  is the single most common cause of "the search is broken" after delivery.

---

## What must the Gallery show when a search term matches no Book?

- **Affects:** REQ-BOOK-023
- **The document says:** "As library grows, search by title/author/language
  becomes essential." (Second brief, unattributed reviewer, 2026-08-21, Usability
  & Interaction Feedback). The document does not mention an empty result.
- **Which could mean:**
  - (a) The Gallery shows nothing at all.
  - (b) The Gallery shows a message saying no Book matched, and offering to clear
    the search.
  - (c) The Gallery shows the existing empty-Library message.
- **Question for the client:** When a search finds nothing, what should the page
  say?
- **Why it matters:** (c) is actively wrong and would be reported as a defect:
  REQ-BOOK-001's fifth criterion requires "a message stating that there are no
  Books yet and inviting the first Book to be added", which is a lie when the
  Library is full and the search simply missed. Reusing that message is the easy
  implementation and the one that will happen unless the client says otherwise.

---

## When a search term narrows the Gallery, does REQ-BOOK-001's requirement to show every Book still hold?

- **Affects:** REQ-BOOK-023
- **The document says:** "The home page should display all books in a clean and
  attractive gallery/grid layout" (Client brief, ITMagnet - Test, email
  2026-08-19), against "No Search/Filter — As library grows, search by
  title/author/language becomes essential." (Second brief, unattributed reviewer,
  2026-08-21)
- **Which could mean:**
  - (a) "All books" describes the Home page as opened, and a search is a temporary
    narrowing that the person asked for. The two sit together.
  - (b) The Gallery must always show every Book, and search should highlight
    matches rather than hide non-matches.
- **Question for the client:** While a search is active, should the non-matching
  books be hidden, or still shown but marked?
- **Why it matters:** REQ-BOOK-001's first criterion is measured: "The Library
  holds three Books / The Home page is opened / The Gallery shows three Book
  cards." Under (a) that criterion needs a qualifier saying "with no search term
  entered", which is a change to an agreed requirement and its tests. Under (b)
  REQ-BOOK-023 as drafted is wrong and has to be rewritten. Neither can be decided
  by reading the brief.

---

## Who chooses dark mode, and is the choice remembered after a restart?

- **Affects:** REQ-BOOK-024
- **The document says:** "No Dark/Light Mode — Not required but expected in modern
  apps. — 🟢 Low" (Second brief, unattributed reviewer, 2026-08-21, Design & UI
  Issues)
- **Which could mean:**
  - (a) The person chooses with a control on the Home page, and the choice is
    remembered the next time the application is opened.
  - (b) The person chooses, and the choice lasts only until the page is reloaded.
  - (c) Nobody chooses: the application follows the operating system's own
    dark-mode setting and offers no control at all.
- **Question for the client:** Should there be a switch on the page, or should the
  application just follow whatever the computer is already set to — and should the
  choice be remembered?
- **Why it matters:** (c) means REQ-BOOK-024's first criterion — a control is
  present — is wrong, and the feature is a stylesheet rule with no control and no
  test of a control. (a) needs somewhere to keep the preference, which is the first
  thing on this project that is stored *per person* rather than as part of the
  Library, and REQ-BOOK-012 says nothing about such a thing.

---

## Is a named colour palette and font now required, when REQ-BOOK-001 says none must be matched?

- **Affects:** REQ-BOOK-024, REQ-BOOK-030
- **The document says:** "Use a consistent color palette (e.g., primary: #1E3A5F,
  accent: #F9A826). … Use a professional font (Inter, Poppins, etc.)." (Second
  brief, unattributed reviewer, 2026-08-21, Recommended Improvements item 2), and
  "Amateur Styling — Colors, fonts, and spacing feel outdated. No visual
  hierarchy. — 🔴 High" (same document, Design & UI Issues). Against this, the
  client wrote on 2026-08-21: "There is no specific brand, colour scheme,
  reference site, or font that needs to be followed."
- **Which could mean:**
  - (a) The client has changed their mind and now wants a specified palette and
    font, and their answer of 2026-08-21 is superseded.
  - (b) The reviewer is offering examples ("e.g.", "etc.") of what a tidier design
    might use, and the client's position — no scheme to match — still stands.
  - (c) The client wants *some* consistent palette and font, but not these
    particular ones.
- **Question for the client:** You told us there was no colour scheme or font to
  follow — has that changed, and if so are these the colours and fonts you want?
- **Why it matters:** REQ-BOOK-001's final criterion is an agreed statement that
  "no brand, colour scheme, reference site or font is required to be matched, and
  a plain tidy layout satisfies the requirement". It exists because the client was
  asked and answered. Building to this document's palette would silently overturn
  that answer, and a visual overhaul judged against an unnamed standard is
  unboundable work — there is no test that says when it is finished. CHG-0005
  records this as a contradiction. No requirement has been written for it.

---

## How slow must an operation be before a loading state is shown?

- **Affects:** REQ-BOOK-025, REQ-BOOK-026
- **The document says:** "No Loading States — No feedback when adding/deleting
  books. — 🟢 Low" (Second brief, unattributed reviewer, 2026-08-21, Design & UI
  Issues)
- **Which could mean:**
  - (a) Always, from the instant the operation begins, however fast it completes.
  - (b) Only when the operation takes longer than some threshold, so a fast local
    add does not flash a spinner on and off.
- **Question for the client:** Should the spinner appear immediately every time, or
  only when something is actually taking a while?
- **Why it matters:** The application runs against a SQLite file on the same PC
  (REQ-BOOK-012), so most operations will finish in a few milliseconds. Under (a)
  the visible result is a flicker, which reads as a defect. Under (b) there is a
  number in the acceptance criteria that only the client can supply, and a test
  that has to control time. REQ-BOOK-025 and REQ-BOOK-026 as drafted assume neither
  and say only "while the submission is in flight".

---

## What does a loading state look like, and where does it appear?

- **Affects:** REQ-BOOK-025, REQ-BOOK-026
- **The document says:** "No Loading States — No feedback when adding/deleting
  books." (Second brief, unattributed reviewer, 2026-08-21, Design & UI Issues).
  The term is not defined anywhere in the document.
- **Which could mean:**
  - (a) A spinner or progress indicator inside the control that was activated.
  - (b) The control's label changing to "Adding…" and the control being disabled.
  - (c) An overlay across the whole Home page that blocks interaction until the
    operation finishes.
- **Question for the client:** While a book is being added or deleted, what should
  the person see — a spinner on the button, changed wording, or the whole page
  held?
- **Why it matters:** "Loading state" is listed in the glossary as a term nobody
  has defined. (c) changes what a person can do mid-operation and interacts with
  REQ-BOOK-032's disabled submit control; (b) overlaps with REQ-BOOK-032 so far
  that they might be one requirement rather than two. Until it is answered,
  "a loading state is shown" is not something a test can check, and REQ-BOOK-025
  and REQ-BOOK-026 cannot leave `draft`.

---

## Where does a success message appear, how long does it stay, and how is it dismissed?

- **Affects:** REQ-BOOK-027, REQ-BOOK-028
- **The document says:** "Feedback messages (toast/snackbar) for actions."
  (Second brief, unattributed reviewer, 2026-08-21, Acceptance Criteria)
- **Which could mean:**
  - (a) A message that appears in a corner, disappears by itself after a few
    seconds, and can be dismissed early.
  - (b) A message that stays on the Home page until the person dismisses it.
  - (c) A line of text in the Gallery area, in the same place as other page
    messages.
- **Question for the client:** After a book is added or deleted, where should the
  confirmation appear and should it disappear on its own?
- **Why it matters:** "Toast" and "Snackbar" are listed in the glossary as
  undefined, and are UI-library names rather than anything from this project's
  domain — the phrase implies a component library, which REQ-BOOK-013 and the
  original brief's "avoid unnecessary dependencies" both bear on. A message that
  disappears on a timer needs a duration nobody has named and a test that controls
  the clock; one that must be dismissed needs a dismiss control. REQ-BOOK-027 and
  REQ-BOOK-028 as drafted require only that a message is shown.

---

## Does a toast or snackbar replace the in-form error message REQ-BOOK-007 already requires, or sit alongside it?

- **Affects:** REQ-BOOK-027, REQ-BOOK-028
- **The document says:** "No Success/Error Messages — User gets no feedback after
  Add/Delete actions. — 🟡 Medium" (Second brief, unattributed reviewer,
  2026-08-21, Usability & Interaction Feedback), and "Feedback messages
  (toast/snackbar) for actions." (same document, Acceptance Criteria)
- **Which could mean:**
  - (a) Successes get a toast; errors keep the in-form message REQ-BOOK-007
    already requires. Two mechanisms, each for what it is best at.
  - (b) Everything becomes a toast, and the in-form error message goes away.
  - (c) Everything gets a toast *and* errors keep the in-form message, so a
    refused submission produces two messages.
- **Question for the client:** When a submission is refused, should the reason stay
  next to the field it belongs to, pop up as a message, or both?
- **Why it matters:** REQ-BOOK-007's seventh criterion is agreed and delivered:
  "An error message naming what is wrong is shown in the Add Book form." Under (b)
  that criterion is removed, which is a change to an agreed requirement and its
  tests, and it also makes the error harder to act on because it is no longer
  beside the field. CHG-0010 judges only the *success* half to be new scope; the
  error half is already covered. (c) is the outcome nobody intends and the one that
  happens by default if this is not answered.

---

## Which icon set is to be used, and does adding it satisfy REQ-BOOK-013?

- **Affects:** REQ-BOOK-029, REQ-BOOK-030
- **The document says:** "Add icons (FontAwesome or Material Icons)." (Second
  brief, unattributed reviewer, 2026-08-21, Recommended Improvements item 2)
- **Which could mean:**
  - (a) A third-party icon package is added as a dependency, and the client accepts
    it as necessary.
  - (b) Icons are drawn inline as SVG with no dependency at all.
  - (c) Icons are loaded from a CDN, which the local development PC cannot reach
    when offline.
- **Question for the client:** Are you happy for us to add an icon library as a
  dependency, or would you rather we drew the few icons we need ourselves?
- **Why it matters:** REQ-BOOK-013 is agreed and requires that every declared
  runtime dependency "carries a recorded reason naming the application behaviour
  that requires it", and the original brief said "avoid unnecessary dependencies".
  Adding a several-thousand-icon package for a trash can and a plus sign is exactly
  the kind of thing that requirement exists to catch, so this is a question the
  client should answer rather than a preference we exercise. (c) additionally
  breaks REQ-BOOK-011's "no external service" criterion.

---

## Which controls must carry an icon?

- **Affects:** REQ-BOOK-030
- **The document says:** "Missing Icons/Visuals — No cover images, generic
  typography, flat buttons. — 🔴 High" and "Add icons (FontAwesome or Material
  Icons)." (Second brief, unattributed reviewer, 2026-08-21)
- **Which could mean:**
  - (a) Every control on the Home page and in the Add Book form.
  - (b) Only the main actions — add, delete — and nothing else.
  - (c) Icons instead of text labels, not as well as them.
- **Question for the client:** Which buttons should have icons, and should the icon
  replace the wording or sit next to it?
- **Why it matters:** REQ-BOOK-030 as drafted says "every one of them", which is
  the widest reading and may well be more than was meant — it would put an icon on
  a Cancel control and on a search box. (c) collides with REQ-BOOK-004, which is
  agreed and requires a control "labelled '+ Add Book'": replacing that text with a
  plus icon alone would break it. Without an answer the requirement is either
  over-scoped or contradicts an agreed one.

---

## Does "clear form after successful add" also clear the form after a submission the application refuses?

- **Affects:** REQ-BOOK-031
- **The document says:** "Clear form after successful add." (Second brief,
  unattributed reviewer, 2026-08-21, Recommended Improvements item 5)
- **Which could mean:**
  - (a) Only after a success. A refused submission keeps everything the person
    typed, as REQ-BOOK-007 already requires.
  - (b) After every submission attempt, successful or not.
- **Question for the client:** If we refuse a submission, should the details the
  person typed stay in the form?
- **Why it matters:** The word "successful" is in the sentence, which points at
  (a) — but the same document's Cancel item asks for the form to be reset, and
  someone implementing both may not notice the difference. (b) directly contradicts
  REQ-BOOK-007's eighth criterion, "the values already entered are still shown in
  the form", and would make a mistyped Price cost the person all four fields.
  Recording the question is cheaper than discovering it in review.

---

## Does "disable the Add Book button while submitting" mean the "+ Add Book" control on the Home page or the submit control inside the Add Book form?

- **Affects:** REQ-BOOK-032
- **The document says:** "Disable "Add Book" button while submitting." (Second
  brief, unattributed reviewer, 2026-08-21, Recommended Improvements item 5)
- **Which could mean:**
  - (a) The submit control inside the Add Book form, so the form cannot be
    submitted twice and produce two Books.
  - (b) The "+ Add Book" control on the Home page, so a second Add Book form cannot
    be opened while one is in flight.
- **Question for the client:** Which button should go grey while a book is being
  added — the one inside the form, or the "+ Add Book" button on the page?
- **Why it matters:** Both controls have a claim on the name: REQ-BOOK-004 is
  agreed and fixes the Home page control's label as "+ Add Book", while the
  control that actually submits sits inside the form and is what a double-click
  would hit. Only (a) prevents a duplicate Book, which is the reason the ask
  exists. REQ-BOOK-032 as drafted assumes (a); if (b) was meant, it is the wrong
  requirement and the duplicate-submission risk is untouched.

---

# Part 2 — questions against requirements that are already `agreed`

These are recorded **here only**. None appears in any requirement's `ambiguities`
list, because every requirement they touch is already `agreed`, and adding an open
ambiguity to an `agreed` requirement would reopen it. Reopening an agreed
requirement is a change record and a client decision. **No new requirement has
been written for any of these**, because writing one would have silently
overwritten an agreed criterion.

---

## Is Edit now in scope, when REQ-BOOK-007 and REQ-BOOK-012 both require that no operation changes a stored Book?

- **Affects:** REQ-BOOK-007 (agreed at v1, now v2), REQ-BOOK-012. **No new
  requirement written.** Recorded as CHG-0004.
- **The document says:** "Edit Functionality — No way to edit existing book
  details. CRUD is incomplete. — 🔴 High" and "Update: Edit button on each card →
  pre-filled modal." (Second brief, unattributed reviewer, 2026-08-21). Against
  this, the client wrote on 2026-08-21: "Editing is not required by the brief. The
  application only needs Add and Delete functionality. If a Book was entered
  incorrectly, it can be deleted and added again."
- **Which could mean:**
  - (a) The client has changed their mind and now wants Edit, and their answer of
    2026-08-21 is superseded.
  - (b) The reviewer did not know the client had ruled Edit out, and is applying a
    general expectation that a CRUD application has all four letters.
- **Question for the client:** You told us editing was not required and a wrong
  book would be deleted and re-added — do you now want an Edit feature instead?
- **Why it matters:** Two agreed criteria positively require the *absence* of edit:
  REQ-BOOK-007's "no control for changing that Book's details is present" and
  REQ-BOOK-012's "no operation is offered that changes an existing Book's stored
  details". A requirement for Edit cannot be written without withdrawing both, and
  CHG-0004 puts the cost at 16 invalidated tests. It also reopens questions the
  Add path has already settled — whether a Book ID may change, and what happens to
  a Book someone is editing while someone else deletes it.

---

## Are phone and tablet layouts now in scope, when REQ-BOOK-014 says they are not?

- **Affects:** REQ-BOOK-014. **No new requirement written.**
- **The document says:** "Poor Responsiveness — Layout breaks on smaller screens.
  — 🟡 Medium" and "□ Responsive on mobile, tablet, desktop." (Second brief,
  unattributed reviewer, 2026-08-21). Against this, the client wrote on 2026-08-21:
  "Phones and tablets are not in scope."
- **Which could mean:**
  - (a) The client has changed their mind and now wants phone and tablet layouts.
  - (b) The reviewer means only that the desktop layout should hold together when
    the window is narrowed — which REQ-BOOK-014 already requires and the
    application already does.
  - (c) The reviewer looked at a still image and inferred the layout would break.
- **Question for the client:** Phones and tablets were out of scope — do you now
  want the application to work on them?
- **Why it matters:** REQ-BOOK-014's final criterion is an agreed statement that
  "no phone or tablet layout is required, those devices being outside the agreed
  scope", and its second criterion already requires the Gallery to reflow when the
  window is narrowed, with no horizontal scrolling. Under (b) there is nothing to
  do. Under (a) there is a second set of layouts, touch targets, and device testing
  the project has no way to do — and it interacts with the Cover Photo work, since
  a card carrying an image is harder to fit on a phone than one carrying five lines
  of text.

---

## Does the request for a delete confirmation dialog ask for anything REQ-BOOK-009 does not already require?

- **Affects:** REQ-BOOK-009. **No new requirement written.**
- **The document says:** "Delete Confirmation — Delete actions should have a
  confirmation dialog to prevent accidental removal. — 🟡 Medium" (Second brief,
  unattributed reviewer, 2026-08-21, Critical Missing Features)
- **Which could mean:**
  - (a) Nothing new. REQ-BOOK-009 already requires that "a confirmation is
    requested before the Book is deleted", and it is delivered.
  - (b) Something specific about the *form* of the confirmation — a styled modal
    over the page rather than the browser's own dialog, naming the Book being
    deleted.
- **Question for the client:** The application already asks you to confirm before
  deleting — is there something about how it asks that you want changed?
- **Why it matters:** If the answer is (a), this is not work and should not be
  estimated, charged or scheduled. If it is (b), it is a small piece of UI work
  that needs its own requirement — and REQ-BOOK-009's third and fourth criteria
  would need a further criterion saying what the confirmation must show. Writing a
  requirement now, before the answer, would duplicate an agreed one and put two
  descriptions of the same behaviour in the record.

---

## Does the request for localStorage persistence ask for anything REQ-BOOK-012 does not already require?

- **Affects:** REQ-BOOK-012. **No new requirement written.**
- **The document says:** "Data Persistence — No backend or localStorage – data
  resets on page refresh. — 🟡 Medium", "Implement localStorage for persistence
  (minimum). Or connect to a mock API (JSON Server, Firebase, etc.)." and "□ Data
  persists after page refresh (localStorage)." (Second brief, unattributed
  reviewer, 2026-08-21)
- **Which could mean:**
  - (a) Nothing new. REQ-BOOK-012 already requires a SQLite database file on the
    local development PC, and the Library already survives a full stop and restart,
    which is stronger than surviving a page refresh.
  - (b) The client actually wants the data in the browser's `localStorage`
    specifically.
  - (c) The client wants an external service — the document names Firebase.
- **Question for the client:** The library is already saved in a database file on
  the PC and survives restarting the application — is that what you want, or did
  you want it stored somewhere else?
- **Why it matters:** (b) is a step backwards and contradicts REQ-BOOK-012's third
  criterion ("present in a SQLite database file held with the application"): data
  in `localStorage` is per-browser, lost when site data is cleared, and cannot be
  seen by a second browser at all — which would also break REQ-BOOK-001's
  second-tab criterion. (c) contradicts REQ-BOOK-011's "no hosting, domain or
  external service" criterion. Under (a) there is no work. Three answers, three
  entirely different projects.

---

## Does the request for form validation ask for anything REQ-BOOK-006 and REQ-BOOK-007 do not already require?

- **Affects:** REQ-BOOK-006, REQ-BOOK-007. **No new requirement written.**
- **The document says:** "Validation — No validation on Add Book form (empty
  fields, invalid price, etc.). — 🟡 Medium", "Validate all fields (required,
  price as number, etc.)." and "□ Form validation with error messages." (Second
  brief, unattributed reviewer, 2026-08-21)
- **Which could mean:**
  - (a) Nothing new. REQ-BOOK-006 already refuses a submission with any of Name,
    Author, Language or Price empty and refuses a Price that is not a number, and
    REQ-BOOK-007 already requires "an error message naming what is wrong" shown in
    the form.
  - (b) Further rules nobody has stated — a minimum Name length, a negative Price,
    a maximum field length, a duplicate-Name check.
- **Question for the client:** The form already refuses empty fields and a price
  that is not a number, and says which field is wrong — is there a rule you want
  that it is not applying?
- **Why it matters:** (b) is where the real questions live and none of them is
  answered: is a Price of 0 valid, is a negative Price valid, how long may a Name
  be, may two Books share a Name. Those need answers before any of them becomes a
  criterion. Writing a "validation" requirement now would restate REQ-BOOK-006 in
  different words and leave the actual gaps exactly where they are.

---

## Does the request for a modal with overlay ask for anything REQ-BOOK-005 does not already require?

- **Affects:** REQ-BOOK-005. **No new requirement written.**
- **The document says:** "Popup UX — Add Book popup feels disconnected. Should be
  a modal with overlay. — 🟡 Medium" (Second brief, unattributed reviewer,
  2026-08-21, Usability & Interaction Feedback)
- **Which could mean:**
  - (a) Nothing new. REQ-BOOK-005 already requires the Add Book form to be "shown
    as a modal over the Home page", and it is delivered with an overlay.
  - (b) Something about how it looks or behaves — a dimmed backdrop, closing on a
    click outside, an animation — that "feels disconnected" is pointing at without
    naming.
- **Question for the client:** The Add Book form already opens as a modal over a
  dimmed page — what specifically feels disconnected about it?
- **Why it matters:** "Feels disconnected" is not something a test can check, and
  it is the only evidence given. Until the client says what they want changed,
  there is no criterion to write and no way to know when it is done. If the answer
  is (a) this should not be estimated at all; if it is (b), the answer will name a
  behaviour — closing on outside click, for instance — which then needs its own
  requirement and interacts with whether unsaved entries are lost.

---

## Must the Cancel control reset the Add Book form, when REQ-BOOK-006 requires typed values to survive redisplay?

- **Affects:** REQ-BOOK-005, REQ-BOOK-006. **No new requirement written.**
  Recorded as CHG-0009.
- **The document says:** "Cancel Button — Currently does nothing – should close
  modal and reset form. — 🟡 Medium" (Second brief, unattributed reviewer,
  2026-08-21, Usability & Interaction Feedback)
- **Which could mean:**
  - (a) Cancel should close the modal and discard everything typed, so reopening
    the form starts blank.
  - (b) Cancel should close the modal and keep what was typed, so someone who
    closed it by mistake does not lose their work.
- **Question for the client:** If someone presses Cancel and then reopens the form,
  should what they typed still be there?
- **Why it matters:** REQ-BOOK-006's seventh criterion is agreed: "a value is typed
  into an entry control and the form is redisplayed without being submitted / the
  typed value is still shown in that control". Reset-on-Cancel contradicts it
  directly and CHG-0009 puts the cost at 8 invalidated tests. Separately, the
  premise is disputed: the Cancel control does close the modal today, so "currently
  does nothing" is not what the delivered application does — see the question about
  the mockup below.

---

# Part 3 — questions about the document itself

---

## Who wrote the second brief, and does the client endorse it as a change to the agreed scope?

- **Affects:** every requirement REQ-BOOK-015 … REQ-BOOK-032, and CHG-0002 …
  CHG-0012.
- **The document says:** "To: Development Team / Project: Book Library Management
  (CRUD) / Date: August 21, 2026 / Status: 🔴 Needs significant improvement before
  production" (Second brief, unattributed reviewer, 2026-08-21). `BRIEF.md` records
  that the document "carries no author, no role, and no reference designs were
  attached".
- **Which could mean:**
  - (a) It is the client's own review, and everything in it is an instruction.
  - (b) It is a third party's opinion — a reviewer, a designer, an internal
    stakeholder — that the client has not seen or has not endorsed.
- **Question for the client:** Is this review yours, and do you want us to treat it
  as a change to what we agreed on 2026-08-21?
- **Why it matters:** This document contradicts three written answers the client
  gave on 2026-08-21 — on editing, on phones and tablets, and on colour and font.
  If (b), those answers still stand and eleven change records should be closed
  rather than priced. If (a), the client is changing scope they settled two days
  earlier and the commercial position needs saying out loud. Every one of
  CHG-0002 … CHG-0012 has a blank `decision` and a blank `commercial` field:
  nobody has agreed to pay for any of this, and the requirements written above
  stay `draft` until someone does.

---

## Was the second brief written against the running application, or against the current design mockup its Attachments name?

- **Affects:** the five questions in Part 2 above that ask whether an ask is
  already covered, and CHG-0009.
- **The document says:** "📎 Attachments / Current design mockup (your image) /
  Reference designs (attach if available)" (Second brief, unattributed reviewer,
  2026-08-21) — and, of the delivered application, "No backend or localStorage –
  data resets on page refresh", "No validation on Add Book form", "Cancel Button:
  Currently does nothing".
- **Which could mean:**
  - (a) The reviewer used the running application and these are real defects, in
    which case the delivered behaviour and the agreed requirements have diverged
    and that is serious.
  - (b) The reviewer worked from a still image — the "current design mockup" their
    own Attachments section names — and reported as missing everything a still
    image cannot show.
- **Question for the client:** Did whoever wrote this run the application, or were
  they looking at a picture of it?
- **Why it matters:** Six of the document's items describe behaviour the
  application was measured to have on 2026-08-21: the delete confirmation,
  persistence across a full restart, per-field validation messages, the modal
  overlay, the Cancel control, and the responsive reflow. Under (b) all six are
  observation errors and should be withdrawn rather than costed — roughly a third
  of the document. Under (a) they are defects and the priority is finding out how
  agreed, delivered and tested behaviour got lost. The two answers point at
  opposite next actions, and nobody can tell which from the document alone.

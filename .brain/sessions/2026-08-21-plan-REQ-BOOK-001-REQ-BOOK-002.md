# Plan — REQ-BOOK-001@v1, REQ-BOOK-002@v1

**The Home page shows every Book in the Library as a Gallery of Book cards**, and
**each Book card shows that Book's Book ID, Name, Author, Language and Price.**

Both `agreed`, both version 1. REQ-BOOK-001 depends on REQ-BOOK-012, which is
`in_progress` and green — the store exists, so this is not built on a guess.
REQ-BOOK-002 depends on REQ-BOOK-001, so the two are planned together: splitting
them would mean designing the Book card twice.

Planned 2026-08-21, after `/tdd` was invoked for these ids with no plan in place.

---

## Read the constraint before the design

**One criterion in this slice cannot be verified by this slice.**

REQ-BOOK-001 criterion 7 — a second browser tab, reloaded, shows a Book added in
the first — needs a served page and a browser. REQ-BOOK-011 (the application runs
under Node.js and returns the Home page) is still `agreed` and unbuilt. There is
nothing to open a tab against.

Criterion 3 (a grid of more than one column) and criterion 8 (appearance) are the
same shape: both are about rendered CSS in a real browser, and neither is
honestly checkable from a unit test asserting on an HTML string.

So this slice can pin down **12 of the 17 criteria** properly, and three of the
remaining five only weakly. That is worth knowing before rather than after.

**Two ways to handle it, and the developer picks:**

- **(a) Add REQ-BOOK-011 to this slice.** Build the server here, and criterion 7
  becomes testable through a real HTTP request. Larger slice, but nothing is left
  dangling and the Home page can actually be looked at.
- **(b) Build the render layer only, as planned below.** Criteria 3, 7 and 8 are
  carried forward and annotated when REQ-BOOK-011 lands. Smaller and safer, but
  REQ-BOOK-001 cannot reach `verified` at the end of it, and the gate will say so.

The plan below assumes **(b)** — it is the smaller commitment and it does not
foreclose (a). Say the word and I will fold REQ-BOOK-011 in.

---

## What must be true

Restated as behaviour, grouped by what actually gets built.

**The Home page (REQ-BOOK-001)**
1. Three Books in the Library produce three Book cards. *(1)*
2. A Book in the Library has a card of its own. *(2)*
3. Fifty Books produce fifty cards, and no pagination control appears. *(6)*
4. The newest Book's card comes first. *(4)*
5. An empty Library shows a message inviting the first Book, and no cards. *(5)*
6. The cards sit in a multi-column grid. *(3 — CSS, weakly testable here)*
7. A reloaded second tab shows what the first added. *(7 — needs REQ-BOOK-011)*
8. No brand or colour scheme is required. *(8 — a review criterion, not a test)*

**The Book card (REQ-BOOK-002)**
9. The card shows the Book ID, and shows one even when the person entered none. *(1, 6)*
10. The card shows the Name. *(2)*
11. The card shows the Author. *(3)*
12. The card shows the Language, unchanged, whatever text it is. *(4, 7)*
13. The card shows the Price to exactly two decimal places. *(5, 8)*
14. The Price is shown in BDT, and no other currency appears on any card. *(9)*

---

## Approach

A **pure render layer**: functions that take Books and return HTML. No server, no
DOM, no browser. `renderHomePage(books)` returns the whole document;
`renderBookCard(book)` returns one card. Tested by asserting on the returned
string.

This keeps the slice honest about what it can prove, and it means the server in
REQ-BOOK-011 becomes trivial — it reads the store, calls `renderHomePage`, and
writes the result.

**Escaping is the security decision in this slice, and it is not optional.**
`rules/javascript/security.md` makes `innerHTML` with user-supplied content a
blocking finding, and observes that in a library application the Book title *is*
user content. Nothing here builds DOM, but the same hazard arrives through string
interpolation: a Book named `<script>…</script>` would otherwise execute on the
Home page. Every interpolated value passes through one `escapeHtml` function, and
a test asserts it — a Book named with a tag must appear as text, not markup.

**Files to create:**

| File | Holds |
|---|---|
| `src/web/render-home-page.js` | `renderHomePage(books)` — document, Gallery, empty state |
| `src/web/render-book-card.js` | `renderBookCard(book)` — one card, five fields |
| `src/web/escape-html.js` | `escapeHtml(value)` — the single escaping point |
| `src/web/home-page.css` | The grid, the card, the empty state. Plain, no framework |
| `tests/web/render-home-page.test.js` | REQ-BOOK-001's tests |
| `tests/web/render-book-card.test.js` | REQ-BOOK-002's tests |

`src/web/` rather than `public/` or `assets/`: every file the application is made
of goes under `src/`, served static assets included.

**No new dependencies.** Assertions are made on the HTML string with `node:test`
and `node:assert`. A DOM library or a test-DOM would be a dependency REQ-BOOK-013
would then require a reason for, and string assertions are sufficient for what
these criteria actually say.

---

## Test skeleton

Annotation syntax taken from `adapters/javascript.json` (`// @covers …`), version
confirmed against `book.yaml` today: both requirements are at v1.

`tests/web/render-home-page.test.js`

```js
// @covers REQ-BOOK-001@v1
test('every Book in the Library gets a card in the Gallery', ...)
//   three Books in → three cards out

// @covers REQ-BOOK-001@v1
test('a Book in the Library is present in the Gallery by name', ...)

// @covers REQ-BOOK-001@v1
test('fifty Books are all shown, with no pagination control', ...)
//   fifty cards, and no next/previous/page control in the markup

// @covers REQ-BOOK-001@v1
test('the most recently added Book appears first in the Gallery', ...)
//   asserts card order, not just presence

// @covers REQ-BOOK-001@v1
test('an empty Library shows an invitation to add the first Book, and no cards', ...)

// @covers REQ-BOOK-001@v1
test('the Gallery is laid out as a multi-column grid', ...)
//   WEAK. Asserts the Gallery carries the grid class and the stylesheet
//   declares more than one column for it. It does not prove a browser renders
//   two columns. Criterion 3 is only properly closed by REQ-BOOK-011 plus a
//   browser, and this test should not be mistaken for having done that.

test('a Book named with a script tag is shown as text, not markup', ...)
//   No @covers: no criterion demands it. It is a blocking security rule in
//   rules/javascript/security.md, and it is the reason escape-html.js exists.
```

`tests/web/render-book-card.test.js`

```js
// @covers REQ-BOOK-002@v1
test('a Book card shows the Book ID', ...)
// @covers REQ-BOOK-002@v1
test('a Book card shows the Name', ...)
// @covers REQ-BOOK-002@v1
test('a Book card shows the Author', ...)
// @covers REQ-BOOK-002@v1
test('a Book card shows the Language exactly as it was entered', ...)
//   uses a Language outside any conventional list, e.g. "Chakma"
// @covers REQ-BOOK-002@v1
test('a Book card shows the Price with exactly two decimal places', ...)
//   a Book stored at 350 shows 350.00, not 350 and not 350.0
// @covers REQ-BOOK-002@v1
test('a Book card shows the Price in BDT and in no other currency', ...)
//   asserts the BDT marker is present and no other currency symbol appears
// @covers REQ-BOOK-002@v1
test('a Book added without a Book ID still shows one on its card', ...)
//   built through the real store, so the issued Book ID is real, not a fixture
```

Not covered here, and deliberately: criterion 7 (second tab) and criterion 8
(appearance). Criterion 7 goes to REQ-BOOK-011. Criterion 8 is a review
criterion — it says nothing must be matched — and no test can assert the absence
of a requirement that was never imposed. It is closed at sign-off, not by code.

---

## Decisions this forces

**1. Server-rendered HTML, or a JSON API with client-side rendering?** This plan
assumes server-rendered: the Home page arrives complete. It is fewer moving
parts, needs no client framework, and satisfies REQ-BOOK-013 without argument.
But it points at REQ-BOOK-008 ("appears immediately after submission"), whose
client answer said a full reload is acceptable — so server rendering works there
too. **This is the architectural fork of the whole front end and wants an ADR
before the code, not after.** Choosing it here quietly would be exactly the
mistake ADR-0001 exists to avoid repeating.

**2. Where the Price's BDT marker goes.** Criterion 9 says the Price is shown in
BDT and no other currency appears. `৳350.00`, `BDT 350.00` and `350.00 BDT` all
satisfy it. Cheap to change now, tedious once tests assert a string.

**3. Whether the card's Book ID is visible text or a `data-` attribute.**
Criterion 1 says the card *shows* the Book ID, which reads as visible. Worth
confirming — a visible integer id on every card is unusual in a real product, and
the client asked for it explicitly.

---

## What I am unsure about

- **Criterion 3 gets a weak test and I would rather say so than dress it up.**
  Asserting a CSS class and a stylesheet rule is not the same as a browser
  laying out two columns.
- **Criterion 8 gets no test at all.** It is not testable by construction.
- **REQ-BOOK-001 cannot reach `verified` from this slice** under option (b), and
  `check-traceability` will keep reporting it as annotated-but-incomplete.
- **The store returns Books newest-first already** (`ORDER BY id DESC`, chosen in
  the REQ-BOOK-012 slice). The render layer will not re-sort. That means
  criterion 4 is really being satisfied by the store, and the render test proves
  only that render preserves order. Worth being clear about rather than letting
  the test imply more.
- **I have assumed the Book card is a `<li>` in a `<ul>`.** Semantics matter for
  the accessibility nobody has asked for and everybody expects.

---

## Waiting for approval

No test and no code has been written for either requirement. Nothing outside
`.brain/sessions/` has been touched by this plan.

Two things want an answer before `/tdd`:

1. **Option (a) or (b)** — fold REQ-BOOK-011 in, or render layer only.
2. **Server-rendered HTML** as the front-end approach — confirm, and I will write
   ADR-0002 before the first test.

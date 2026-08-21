# FB-0001 — UI/UX and functional review: "not ready for client delivery"

- **Received:** 2026-08-21
- **From:** unattributed — the report is addressed "To: Development Team" and
  carries no author. **Ask who wrote it before acting on it.**
- **Channel:** written report, pasted 2026-08-21
- **Anchors:** REQ-BOOK-001, REQ-BOOK-002, REQ-BOOK-005, REQ-BOOK-006,
  REQ-BOOK-007, REQ-BOOK-009, REQ-BOOK-012, REQ-BOOK-014
- **Triage:** proposed — **mixed**; see the per-item table. Nine items appear to
  describe software other than what was delivered.
- **Sentiment:** negative

---

## What they said

> ## 📘 Book Library – UI/UX & Functional Feedback Report
>
> **To:** Development Team
> **Project:** Book Library Management (CRUD)
> **Date:** August 21, 2026
> **Status:** 🔴 Needs significant improvement before production
>
> ### 🧩 Overview
>
> The current design is functional but visually outdated and lacks several essential features expected in a modern CRUD application. Below is a structured breakdown of issues and required changes.
>
> ### ❌ Critical Missing Features
>
> | Issue | Description | Priority |
> |-------|-------------|----------|
> | **Cover Photo Upload** | No field or preview for book covers. This is essential for visual appeal. | 🔴 High |
> | **Cover Display** | Book cards must show cover images (thumbnail + full view option). | 🔴 High |
> | **Edit Functionality** | No way to edit existing book details. CRUD is incomplete. | 🔴 High |
> | **Delete Confirmation** | Delete actions should have a confirmation dialog to prevent accidental removal. | 🟡 Medium |
> | **Data Persistence** | No backend or localStorage – data resets on page refresh. | 🟡 Medium |
> | **Validation** | No validation on Add Book form (empty fields, invalid price, etc.). | 🟡 Medium |
>
> ### 🎨 Design & UI Issues
>
> | Issue | Description | Priority |
> |-------|-------------|----------|
> | **Amateur Styling** | Colors, fonts, and spacing feel outdated. No visual hierarchy. | 🔴 High |
> | **Missing Icons/Visuals** | No cover images, generic typography, flat buttons. | 🔴 High |
> | **Poor Responsiveness** | Layout breaks on smaller screens. | 🟡 Medium |
> | **No Dark/Light Mode** | Not required but expected in modern apps. | 🟢 Low |
> | **No Loading States** | No feedback when adding/deleting books. | 🟢 Low |
>
> ### 🧪 Usability & Interaction Feedback
>
> | Issue | Description | Priority |
> |-------|-------------|----------|
> | **Popup UX** | Add Book popup feels disconnected. Should be a modal with overlay. | 🟡 Medium |
> | **Cancel Button** | Currently does nothing – should close modal and reset form. | 🟡 Medium |
> | **No Success/Error Messages** | User gets no feedback after Add/Delete actions. | 🟡 Medium |
> | **No Search/Filter** | As library grows, search by title/author/language becomes essential. | 🟢 Low |
>
> ### 📋 Recommended Improvements (Actionable)
>
> #### 1. **Cover Photo Support**
> - Add an `input[type="file"]` in the Add Book form.
> - Accept `.jpg, .png, .webp`.
> - Show a preview thumbnail before submitting.
> - Display cover on each book card (fallback if none).
>
> #### 2. **Modern Design System**
> - Use a consistent color palette (e.g., primary: `#1E3A5F`, accent: `#F9A826`).
> - Apply rounded corners, shadows, and hover effects.
> - Use a professional font (Inter, Poppins, etc.).
> - Add icons (FontAwesome or Material Icons).
>
> #### 3. **Complete CRUD Operations**
> - **Create:** Add Book with all fields + cover.
> - **Read:** Display all books with covers.
> - **Update:** Edit button on each card → pre-filled modal.
> - **Delete:** Trash icon with confirmation modal.
>
> #### 4. **Data Layer**
> - Implement `localStorage` for persistence (minimum).
> - Or connect to a mock API (JSON Server, Firebase, etc.).
>
> #### 5. **Form Improvements**
> - Validate all fields (required, price as number, etc.).
> - Clear form after successful add.
> - Disable "Add Book" button while submitting.
>
> ### ✅ Acceptance Criteria (for next version)
>
> - [ ] Cover photo upload + preview in Add form.
> - [ ] Cover images displayed on each book card.
> - [ ] Edit functionality for all fields.
> - [ ] Delete with confirmation dialog.
> - [ ] Data persists after page refresh (localStorage).
> - [ ] Responsive on mobile, tablet, desktop.
> - [ ] Form validation with error messages.
> - [ ] Clean, modern UI with consistent spacing/colors.
> - [ ] Feedback messages (toast/snackbar) for actions.
>
> ### 📎 Attachments
>
> - Current design mockup (your image)
> - Reference designs (attach if available)
>
> ### 📩 Final Note
>
> > The current version is a good starting point but **not ready for client delivery**. Please prioritize cover photo support, UI overhaul, and full CRUD functionality. A revised version with these changes will meet professional standards.

---

## What we think it means

**A reading, not a fact.** Everything below this line is interpretation and a
human should review it before any of it is acted on.

### The report does not match the delivered application

Nine of its items describe behaviour the application already has, or scope the
client themselves ruled out in writing on 2026-08-21. Each was re-checked against
the running application on 2026-08-21 before this record was written:

| Their item | Measured against the running application |
|---|---|
| "Delete actions should have a confirmation dialog" | There is one. `GET /?delete=<id>` renders **"Delete this Book? / <the Book's Name> / This cannot be undone."** with Delete and Cancel |
| "No backend or localStorage – data resets on page refresh" | Books are in SQLite at `src/data/library.db`. Measured: **6 Books before a full process restart, 6 after** |
| "No validation on Add Book form" | Submitting empty fields returns three messages: *"Name is required." "Author is required." "Price must be a number with at most two decimal places."* |
| "Popup … should be a modal with overlay" | `.modal` is `position: fixed; inset: 0` with a dimmed backdrop over the Gallery |
| "Cancel Button — currently does nothing" | `<a class="add-book-form__cancel" href="/">Cancel</a>` — it closes the modal |
| "No Success/Error Messages" | Error messages exist, per row 3. Success messages do not |
| "Layout breaks on smaller screens" | The Gallery reflows from four columns to two at 640px |
| "Edit Functionality — CRUD is incomplete" | The client wrote on 2026-08-21: *"Editing is not required by the brief. The application only needs Add and Delete functionality."* |
| "Responsive on mobile, tablet, desktop" | The client wrote on 2026-08-21: *"Phones and tablets are not in scope."* |

The report also calls the styling "amateur" and "outdated", against a client
answer of 2026-08-21: *"A plain, tidy, modern and user-friendly layout is
acceptable. There is no specific brand, colour scheme, reference site, or font
that needs to be followed."*

**The most likely explanation is in the report itself.** Its Attachments section
names *"Current design mockup (your image)"* — a mockup, not the application. A
reviewer working from a still image would be unable to see persistence,
validation, the Cancel link, the confirmation, or the responsive reflow, and
would report every one of them as missing. That fits all nine rows.

**This is a question to ask, not a conclusion to assert.** It is also possible
the reviewer saw a different build, or that the report was drafted generically.
Do not treat the mismatch as the reviewer's error until someone has asked them
what they reviewed.

### What is genuinely new

Two items are real scope the client has never been asked about:

- **Cover photos** — upload, preview, thumbnail on the card, full view. This is
  the report's own top priority. Nothing in the brief or the answers mentions an
  image, and it is not a small addition: it brings file upload, storage of
  binary data, content-type validation, size limits and a fallback image, and it
  touches REQ-BOOK-002, REQ-BOOK-006, REQ-BOOK-007 and REQ-BOOK-012.
- **Search and filter** by title, author or language.

Plus dark mode, loading states, toast messages, icons and a named colour palette
— all outside anything agreed.

### What is a fair hit

- **The Book card shows only the Name.** REQ-BOOK-002 — Book ID, Author,
  Language and Price on the card — is agreed and genuinely not built. The report
  does not name this directly, but "book cards must show…" is adjacent to it, and
  it is the most visible gap in the delivered application.
- **No success message after adding or deleting.** Errors are shown; success is
  silent. No criterion requires one, so it is a variation rather than a defect,
  but the observation is correct.

---

## Proposed triage

**Proposed only. Classification carries commercial consequences and a human
decides it.**

| Item | Class | Why |
|---|---|---|
| Cover photo upload | `variation` | Never in the brief or the answers. Needs `/change-record` and a commercial assessment |
| Cover display on cards | `variation` | Same |
| Edit functionality | `already-agreed` | Client ruled it out in writing, 2026-08-21. Reopening it is a `variation` |
| Delete confirmation | `already-agreed` | Delivered. REQ-BOOK-009 criterion 3 |
| Data persistence | `already-agreed` | Delivered. REQ-BOOK-012, measured across a restart |
| Form validation | `already-agreed` | Delivered. REQ-BOOK-006 criteria 9–13, REQ-BOOK-007 criteria 7–8 |
| Popup should be a modal with overlay | `already-agreed` | Delivered. REQ-BOOK-005 |
| Cancel button does nothing | `already-agreed` | Delivered — it is a link to `/` |
| Poor responsiveness / mobile + tablet | `already-agreed` | Client scoped to desktop only, 2026-08-21 |
| Amateur styling / design system / icons / fonts | `preference` → `variation` | Client accepted "plain, tidy" with no brand to match. A named palette and icon set is new scope |
| No success messages | `variation` | Correct observation; no criterion requires it |
| Search / filter | `variation` | New scope |
| Dark mode | `variation` | The report itself says "not required" |
| Loading states | `variation` | New scope |
| Book card missing four fields | `defect`-adjacent | REQ-BOOK-002 is agreed and not yet built. Not a defect — unbuilt agreed scope. It is the next slice |

**Nothing here is classified `defect`.** No agreed acceptance criterion has been
shown to be unsatisfied by this report.

---

## Resolution

**Open.** Nothing has been actioned.

Three things have to happen before anything is built from this:

1. **Establish who wrote it and what they reviewed** — the running application,
   or the mockup image its own Attachments section names. Nine items depend on
   the answer.
2. **Put the mismatch to the client, carefully and without blame.** If the
   reviewer speaks for the client, the client is about to be told their project
   is failing on points that are demonstrably delivered. That is worth
   correcting with evidence — screenshots and the measured restart — before it
   hardens into a view.
3. **Route the genuinely new asks through `/change-record`.** Cover photos alone
   is a substantial variation, and the report presents it as the top priority.

Related: **REQ-BOOK-002 is agreed, unbuilt, and is the most visible gap.**
Building it addresses the strongest fair criticism here regardless of how the
rest is triaged.

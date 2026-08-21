# Source brief

Received: 2026-08-19, from ITMagnet - Test, via email

> Create a simple and modern Book Library application using Node.js. The home page should display all books in a clean and attractive gallery/grid layout, with each book card showing the Book ID, Name, Author, Language, and Price, along with a Delete option. Add an "+ Add Book" button on the home page that opens a popup/modal form where users can enter the book details. After submitting the form, the new book should be added to the library and immediately displayed in the gallery. Each book should have a Delete button to remove it from the library. The application should be simple, responsive, easy to run on a local development PC, use a simple data store, avoid unnecessary dependencies, and provide a clean and user-friendly interface.

Nothing else was said.

---

# Source brief — 2026-08-21

Received: 2026-08-21, from an unattributed reviewer (the document is addressed
"To: Development Team" and names no author), via a written report pasted into
the session.

**Captured verbatim, formatting and all.** The tables below arrived as
tab-separated text; they are reproduced as they were sent rather than tidied
into Markdown tables, because how a document was written is sometimes the
evidence.

> To: Development Team
> Project: Book Library Management (CRUD)
> Date: August 21, 2026
> Status: 🔴 Needs significant improvement before production
>
> 🧩 Overview
> The current design is functional but visually outdated and lacks several essential features expected in a modern CRUD application. Below is a structured breakdown of issues and required changes.
>
> ❌ Critical Missing Features
> Issue	Description	Priority
> Cover Photo Upload	No field or preview for book covers. This is essential for visual appeal.	🔴 High
> Cover Display	Book cards must show cover images (thumbnail + full view option).	🔴 High
> Edit Functionality	No way to edit existing book details. CRUD is incomplete.	🔴 High
> Delete Confirmation	Delete actions should have a confirmation dialog to prevent accidental removal.	🟡 Medium
> Data Persistence	No backend or localStorage – data resets on page refresh.	🟡 Medium
> Validation	No validation on Add Book form (empty fields, invalid price, etc.).	🟡 Medium
> 🎨 Design & UI Issues
> Issue	Description	Priority
> Amateur Styling	Colors, fonts, and spacing feel outdated. No visual hierarchy.	🔴 High
> Missing Icons/Visuals	No cover images, generic typography, flat buttons.	🔴 High
> Poor Responsiveness	Layout breaks on smaller screens.	🟡 Medium
> No Dark/Light Mode	Not required but expected in modern apps.	🟢 Low
> No Loading States	No feedback when adding/deleting books.	🟢 Low
> 🧪 Usability & Interaction Feedback
> Issue	Description	Priority
> Popup UX	Add Book popup feels disconnected. Should be a modal with overlay.	🟡 Medium
> Cancel Button	Currently does nothing – should close modal and reset form.	🟡 Medium
> No Success/Error Messages	User gets no feedback after Add/Delete actions.	🟡 Medium
> No Search/Filter	As library grows, search by title/author/language becomes essential.	🟢 Low
> 📋 Recommended Improvements (Actionable)
> 1. Cover Photo Support
> Add an input[type="file"] in the Add Book form.
>
> Accept .jpg, .png, .webp.
>
> Show a preview thumbnail before submitting.
>
> Display cover on each book card (fallback if none).
>
> 2. Modern Design System
> Use a consistent color palette (e.g., primary: #1E3A5F, accent: #F9A826).
>
> Apply rounded corners, shadows, and hover effects.
>
> Use a professional font (Inter, Poppins, etc.).
>
> Add icons (FontAwesome or Material Icons).
>
> 3. Complete CRUD Operations
> Create: Add Book with all fields + cover.
>
> Read: Display all books with covers.
>
> Update: Edit button on each card → pre-filled modal.
>
> Delete: Trash icon with confirmation modal.
>
> 4. Data Layer
> Implement localStorage for persistence (minimum).
>
> Or connect to a mock API (JSON Server, Firebase, etc.).
>
> 5. Form Improvements
> Validate all fields (required, price as number, etc.).
>
> Clear form after successful add.
>
> Disable "Add Book" button while submitting.
>
> ✅ Acceptance Criteria (for next version)
> □ Cover photo upload + preview in Add form.
> □ Cover images displayed on each book card.
> □ Edit functionality for all fields.
> □ Delete with confirmation dialog.
> □ Data persists after page refresh (localStorage).
> □ Responsive on mobile, tablet, desktop.
> □ Form validation with error messages.
> □ Clean, modern UI with consistent spacing/colors.
> □ Feedback messages (toast/snackbar) for actions.
> 📎 Attachments
> Current design mockup (your image)
>
> Reference designs (attach if available)
>
> 📩 Final Note
> The current version is a good starting point but not ready for client delivery. Please prioritize cover photo support, UI overhaul, and full CRUD functionality. A revised version with these changes will meet professional standards.

Nothing else was said. No author, no role, and no reference designs were
attached.

## Facts about this document that belong with it

Recorded here because they bear on how it should be read, and because separating
them from the quote above is the point of this file.

1. **It was already captured as feedback and triaged.** The same text is
   `FB-0001`, and `/find-variation` split it into 17 asks judged against the
   agreed requirements: 3 already-agreed, 3 escalate, 11 variations
   (`CHG-0002` … `CHG-0012`), 0 defects. Those change records still carry blank
   `decision` and `commercial` fields — **nobody has agreed to pay for any of
   this.** Decomposing it into requirements does not change that, and any
   requirement arising from it stays `draft` until the commercial position is
   settled.

2. **Six of its items describe behaviour the application already has**, measured
   against the running application on 2026-08-21: the delete confirmation, data
   persistence across a full restart, form validation with per-field messages,
   the modal overlay, the Cancel control, and the responsive reflow.

3. **Three of its items contradict the client's own written answers** of
   2026-08-21, recorded in `ANSWERS.md`: editing ("Editing is not required by
   the brief"), phones and tablets ("Phones and tablets are not in scope"), and
   the visual treatment ("There is no specific brand, colour scheme, reference
   site, or font that needs to be followed").

4. **Its own Attachments section names "Current design mockup (your image)"** —
   a mockup, not the application. A reviewer working from a still image could
   not observe persistence, validation, the Cancel control, the confirmation or
   the reflow, and would report each as missing. That would explain point 2.
   **It is a question for the author, not a conclusion.**

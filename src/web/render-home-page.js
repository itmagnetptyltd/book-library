import { renderBookCard } from './render-book-card.js';
import { renderAddBookForm } from './render-add-book-form.js';
import { renderDeleteConfirmation } from './render-delete-confirmation.js';

/**
 * The Home page: the whole document, ready to serve.
 *
 * The Books arrive in the order the store returned them — newest first — and
 * are not re-sorted here. At most one modal is shown at a time; which, if any,
 * comes from the URL (ADR-0003).
 *
 * @param {{books: ReadonlyArray<{id: number, name: string}>,
 *          addBookForm?: {values?: Record<string, string>,
 *                         errors?: Array<{field: string, message: string}>} | null,
 *          confirmDelete?: {id: number, name: string} | null}} view
 * @returns {string}
 */
export function renderHomePage({ books, addBookForm = null, confirmDelete = null }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Book Library</title>
    <link rel="stylesheet" href="/home-page.css">
  </head>
  <body>
    <header class="page-header">
      <h1>Book Library</h1>
      <a class="add-book-control" href="/?add">+ Add Book</a>
    </header>
    <main class="page-main">
${renderGallery(books)}
    </main>
${renderModal(addBookForm, confirmDelete)}
  </body>
</html>
`;
}

/**
 * At most one modal. The Add Book form wins if the URL somehow asks for both.
 *
 * @param {object|null} addBookForm
 * @param {object|null} confirmDelete
 * @returns {string}
 */
function renderModal(addBookForm, confirmDelete) {
  if (addBookForm !== null) {
    return renderAddBookForm(addBookForm);
  }

  if (confirmDelete !== null) {
    return renderDeleteConfirmation(confirmDelete);
  }

  return '';
}

/**
 * @param {ReadonlyArray<{id: number, name: string}>} books
 * @returns {string}
 */
function renderGallery(books) {
  if (books.length === 0) {
    return '      <p class="empty-library">There are no Books yet. Add the first Book to get started.</p>';
  }

  const cards = books.map((book) => renderBookCard(book)).join('\n        ');
  return `      <ul class="gallery">\n        ${cards}\n      </ul>`;
}

import { escapeHtml } from './escape-html.js';

/**
 * The confirmation asked for before a Book is deleted.
 *
 * Deleting is permanent — the glossary is explicit that a deleted Book is not
 * archived, not hidden and not recoverable — so the Book is named here rather
 * than referred to by its Book ID, and the removal is a POST.
 *
 * @param {{id: number, name: string}} book
 * @returns {string}
 */
export function renderDeleteConfirmation(book) {
  return `      <div class="modal">
        <form class="delete-confirmation" method="post" action="/books/delete">
          <h2 class="delete-confirmation__title">Delete this Book?</h2>
          <p class="delete-confirmation__book">${escapeHtml(book.name)}</p>
          <p class="delete-confirmation__warning">This cannot be undone.</p>
          <input type="hidden" name="id" value="${escapeHtml(String(book.id))}">
          <div class="delete-confirmation__actions">
            <button class="delete-confirmation__submit" type="submit">Delete</button>
            <a class="delete-confirmation__cancel" href="/">Cancel</a>
          </div>
        </form>
      </div>`;
}

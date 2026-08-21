import { escapeHtml } from './escape-html.js';

/**
 * One Book card.
 *
 * REQ-BOOK-001 needs a card for each Book; REQ-BOOK-003 needs each card to
 * carry a Delete control. The five fields the card must show — Book ID, Name,
 * Author, Language and Price — are REQ-BOOK-002 and are not here yet.
 *
 * The Delete control is an anchor, not a button: activating it opens a
 * confirmation and cannot itself delete anything (ADR-0003, REQ-BOOK-009).
 *
 * @param {{id: number, name: string}} book
 * @returns {string}
 */
export function renderBookCard(book) {
  return `<li class="book-card"><h2 class="book-card__name">${escapeHtml(book.name)}</h2>` +
    `<a class="book-card__delete" href="/?delete=${escapeHtml(String(book.id))}">Delete</a></li>`;
}

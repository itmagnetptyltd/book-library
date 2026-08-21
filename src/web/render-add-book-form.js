import { escapeHtml } from './escape-html.js';

/**
 * The four entry controls, in the order a person reads them. There is no Book ID
 * control — the application issues it — and no currency control, because every
 * Price is BDT.
 */
const ENTRY_CONTROLS = Object.freeze([
  { name: 'name', label: 'Name' },
  { name: 'author', label: 'Author' },
  { name: 'language', label: 'Language' },
  { name: 'price', label: 'Price' },
]);

/**
 * The Add Book form, shown as a modal over the Home page.
 *
 * Its visibility is decided by the URL, not by a script — see ADR-0003. It is
 * rendered only when the caller asks for it.
 *
 * @param {{values?: Record<string, string>, errors?: Array<{field: string, message: string}>}} [state]
 * @returns {string}
 */
export function renderAddBookForm({ values = {}, errors = [] } = {}) {
  return `      <div class="modal">
        <form class="add-book-form" method="post" action="/books">
          <h2 class="add-book-form__title">Add Book</h2>
${renderErrors(errors)}
${ENTRY_CONTROLS.map((control) => renderEntryControl(control, values)).join('\n')}
          <div class="add-book-form__actions">
            <button class="add-book-form__submit" type="submit">Add Book</button>
            <a class="add-book-form__cancel" href="/">Cancel</a>
          </div>
        </form>
      </div>`;
}

/**
 * @param {Array<{field: string, message: string}>} errors
 * @returns {string}
 */
function renderErrors(errors) {
  if (errors.length === 0) {
    return '';
  }

  const items = errors
    .map((error) => `            <li>${escapeHtml(error.message)}</li>`)
    .join('\n');

  return `          <ul class="form-error">\n${items}\n          </ul>`;
}

/**
 * @param {{name: string, label: string}} control
 * @param {Record<string, string>} values
 * @returns {string}
 */
function renderEntryControl(control, values) {
  const value = escapeHtml(values[control.name] ?? '');
  return `          <label class="add-book-form__field">
            <span>${control.label}</span>
            <input type="text" name="${control.name}" value="${value}">
          </label>`;
}

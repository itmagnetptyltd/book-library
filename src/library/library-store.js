import { openDatabase } from './database.js';

/**
 * A Price as entered: digits, optionally a decimal point and one or two more.
 *
 * The whole part is capped at 12 digits so the poisha it converts to stays an
 * exact integer. Unbounded, a longer Price converts through floating point and
 * is stored — and read back — as a different number, with no error anywhere.
 *
 * NOTE: this pattern is duplicated in validate-book-details.js. The two must be
 * changed together; consolidating them is a refactor, not a fix.
 */
const PRICE_PATTERN = /^\d{1,12}(?:\.\d{1,2})?$/;

const MINOR_UNITS_PER_TAKA = 100;

/**
 * @typedef {object} Book
 * @property {number} id        the Book ID, issued by the application
 * @property {string} name
 * @property {string} author
 * @property {string} language
 * @property {string} price     BDT, always with two decimal places, e.g. "350.00"
 */

/**
 * Convert an entered Price to poisha, without going through a float.
 *
 * @param {string|number} price
 * @returns {number} an integer count of hundredths of a taka
 */
function toMinorUnits(price) {
  const text = typeof price === 'number' ? String(price) : String(price ?? '').trim();

  if (!PRICE_PATTERN.test(text)) {
    throw new Error(
      `A Book's Price must be a number with at most two decimal places, but was "${text}".`,
    );
  }

  const [whole, fraction = ''] = text.split('.');
  return (
    Number.parseInt(whole, 10) * MINOR_UNITS_PER_TAKA +
    Number.parseInt(fraction.padEnd(2, '0'), 10)
  );
}

/**
 * @param {number} minorUnits
 * @returns {string} the Price in taka, always with two decimal places
 */
function toPrice(minorUnits) {
  const taka = Math.floor(minorUnits / MINOR_UNITS_PER_TAKA);
  const poisha = minorUnits % MINOR_UNITS_PER_TAKA;
  return `${taka}.${String(poisha).padStart(2, '0')}`;
}

/**
 * @param {string|undefined} value
 * @param {string} field
 * @returns {string}
 */
function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`A Book needs a ${field}.`);
  }
  return value.trim();
}

/**
 * @param {{id: number, name: string, author: string, language: string, price_minor: number}} row
 * @returns {Book}
 */
function toBook(row) {
  return Object.freeze({
    id: row.id,
    name: row.name,
    author: row.author,
    language: row.language,
    price: toPrice(row.price_minor),
  });
}

/**
 * Open the Library.
 *
 * The store is the only module that holds SQL. It offers listing, adding and
 * deleting, and deliberately offers no way to change a Book that is already
 * stored — a Book entered wrongly is deleted and added again (REQ-BOOK-012).
 *
 * @param {string} databaseFile absolute path to the SQLite file
 */
export function createLibraryStore(databaseFile) {
  const database = openDatabase(databaseFile);

  const statements = {
    // Newest first, which is the order the Gallery shows Book cards in.
    // AUTOINCREMENT makes the Book ID monotonic, so id descending is age.
    list: database.prepare(
      'SELECT id, name, author, language, price_minor FROM books ORDER BY id DESC',
    ),
    insert: database.prepare(
      'INSERT INTO books (name, author, language, price_minor) VALUES (?, ?, ?, ?)',
    ),
    byId: database.prepare(
      'SELECT id, name, author, language, price_minor FROM books WHERE id = ?',
    ),
    remove: database.prepare('DELETE FROM books WHERE id = ?'),
  };

  /**
   * Every Book in the Library, newest first.
   *
   * @returns {readonly Book[]}
   */
  function listBooks() {
    return Object.freeze(statements.list.all().map(toBook));
  }

  /**
   * Add a Book and return it, carrying the Book ID the application issued.
   *
   * @param {{name: string, author: string, language: string, price: string|number}} details
   * @returns {Book}
   */
  function addBook(details) {
    if (details === null || typeof details !== 'object') {
      throw new Error('A Book needs Name, Author, Language and Price.');
    }

    const name = requireText(details.name, 'Name');
    const author = requireText(details.author, 'Author');
    const language = requireText(details.language, 'Language');
    const priceMinor = toMinorUnits(details.price);

    const result = statements.insert.run(name, author, language, priceMinor);

    return toBook(statements.byId.get(Number(result.lastInsertRowid)));
  }

  /**
   * Remove a Book from the Library, permanently.
   *
   * @param {number} id the Book ID
   * @returns {boolean} whether a Book with that Book ID was there to remove
   */
  function deleteBook(id) {
    // isSafeInteger, not isInteger: a number too large to be exact would be
    // compared against stored ids that cannot represent it either.
    if (!Number.isSafeInteger(id)) {
      throw new Error(`A Book ID must be a whole number, but was "${id}".`);
    }

    return statements.remove.run(id).changes > 0;
  }

  function close() {
    database.close();
  }

  return Object.freeze({ listBooks, addBook, deleteBook, close });
}

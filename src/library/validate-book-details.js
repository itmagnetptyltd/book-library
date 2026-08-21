/** The fields a person may submit for a new Book. Book ID is issued, not entered. */
export const BOOK_FIELDS = Object.freeze(['name', 'author', 'language', 'price']);

const LABELS = Object.freeze({
  name: 'Name',
  author: 'Author',
  language: 'Language',
  price: 'Price',
});

/**
 * A Price as entered: digits, optionally a decimal point and one or two more.
 *
 * The whole part is capped at 12 digits so the poisha it converts to stays an
 * exact integer — see the matching note in library-store.js, which holds the
 * same pattern and must be changed with this one.
 */
const PRICE_PATTERN = /^\d{1,12}(?:\.\d{1,2})?$/;

/**
 * @typedef {{field: string, message: string}} FieldError
 */

/**
 * Check submitted form fields before anything reaches the Library.
 *
 * Expected failures are return values rather than throws: a person leaving a
 * field empty is not exceptional, and both the message and the values they
 * typed have to survive back to the redisplayed form.
 *
 * @param {Record<string, string>} fields
 * @returns {{ok: true, details: {name: string, author: string, language: string, price: string}}
 *          | {ok: false, errors: FieldError[]}}
 */
export function validateBookDetails(fields) {
  /** @type {FieldError[]} */
  const errors = [];

  // Named fields only. An unexpected field is refused rather than ignored, so a
  // rename fails loudly instead of silently dropping what someone typed.
  for (const key of Object.keys(fields)) {
    if (!BOOK_FIELDS.includes(key)) {
      errors.push({ field: key, message: `"${key}" is not a field of a Book.` });
    }
  }

  /** @type {Record<string, string>} */
  const details = {};

  for (const field of BOOK_FIELDS) {
    const value = typeof fields[field] === 'string' ? fields[field].trim() : '';

    if (value === '') {
      errors.push({ field, message: `${LABELS[field]} is required.` });
      continue;
    }

    details[field] = value;
  }

  if (details.price !== undefined && !PRICE_PATTERN.test(details.price)) {
    errors.push({
      field: 'price',
      message: 'Price must be a number with at most two decimal places.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    details: {
      name: details.name,
      author: details.author,
      language: details.language,
      price: details.price,
    },
  };
}

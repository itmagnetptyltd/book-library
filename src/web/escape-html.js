const REPLACEMENTS = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

/**
 * Make a value safe to interpolate into HTML.
 *
 * Every value that reaches the Home page goes through here. A Book's Name,
 * Author and Language are typed by a person, so treating them as markup is how
 * a Book called `<script>…</script>` would run on the Home page. See ADR-0002.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => REPLACEMENTS[character]);
}

/** A Book's four fields do not need more than this. Anything larger is refused. */
export const MAX_BODY_BYTES = 8 * 1024;

const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

/**
 * Read a submitted form body.
 *
 * The body is untrusted: its type is checked before it is read, its size is
 * capped while it is read, and what comes back is a flat object of strings that
 * the caller must still validate. Nothing here decides what a Book is.
 *
 * @param {import('node:http').IncomingMessage} request
 * @returns {Promise<{ok: true, fields: Record<string, string>}
 *          | {ok: false, status: number, message: string}>}
 */
export function readFormBody(request) {
  return new Promise((resolve) => {
    const contentType = String(request.headers['content-type'] ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();

    if (contentType !== FORM_CONTENT_TYPE) {
      request.resume();
      resolve({ ok: false, status: 415, message: 'The request body must be form-encoded.' });
      return;
    }

    /** @type {Buffer[]} */
    const chunks = [];
    let size = 0;
    let tooLarge = false;

    request.on('data', (chunk) => {
      size += chunk.length;

      if (size > MAX_BODY_BYTES) {
        // Stop collecting but keep draining, so the response still reaches a
        // client that is mid-send rather than the connection dying under it.
        tooLarge = true;
        chunks.length = 0;
        return;
      }

      chunks.push(chunk);
    });

    request.on('end', () => {
      if (tooLarge) {
        resolve({ ok: false, status: 413, message: 'The request body is too large.' });
        return;
      }

      const parsed = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
      /** @type {Record<string, string>} */
      const fields = {};

      for (const [key, value] of parsed) {
        fields[key] = value;
      }

      resolve({ ok: true, fields });
    });

    request.on('error', () => {
      resolve({ ok: false, status: 400, message: 'The request body could not be read.' });
    });
  });
}

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = path.dirname(fileURLToPath(import.meta.url));

/** The repository root, one level above `src/`. */
export const PROJECT_ROOT = path.resolve(SOURCE_ROOT, '..');

/**
 * Where the Library lives: a SQLite file on this machine, held with the
 * application. It is data rather than source, so it is git-ignored.
 */
export const DEFAULT_DATABASE_FILE = path.join(SOURCE_ROOT, 'data', 'library.db');

/**
 * Resolve the database file to use. Read once, here, rather than in every
 * module that needs it.
 *
 * @param {string} [override] an explicit path, absolute or relative to the project root
 * @returns {string} an absolute filesystem path
 */
export function resolveDatabaseFile(override) {
  if (override === undefined) {
    return DEFAULT_DATABASE_FILE;
  }

  if (typeof override !== 'string' || override.trim() === '') {
    throw new Error('A database file path must be a non-empty string.');
  }

  return path.resolve(PROJECT_ROOT, override);
}

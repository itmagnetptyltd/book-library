import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const SCHEMA_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');

/**
 * Open the SQLite file holding the Library, creating it and its directory on
 * first use, and applying the schema.
 *
 * Nothing above this module knows the Library is SQLite; nothing below it knows
 * what a Book is.
 *
 * @param {string} databaseFile absolute path to the SQLite file
 * @returns {import('better-sqlite3').Database}
 */
export function openDatabase(databaseFile) {
  if (typeof databaseFile !== 'string' || databaseFile.trim() === '') {
    throw new Error('A database file path must be a non-empty string.');
  }

  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });

  const database = new Database(databaseFile);
  database.pragma('foreign_keys = ON');
  database.exec(fs.readFileSync(SCHEMA_FILE, 'utf8'));

  return database;
}

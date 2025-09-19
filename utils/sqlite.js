const path = require('path');
const Database = require('better-sqlite3');
const { ensureDirectoryExists } = require('./fileDb');

const DATA_DIR = path.join(__dirname, '..', 'data');
ensureDirectoryExists(DATA_DIR);
const DB_PATH = path.join(DATA_DIR, 'app.db');

// Initialize database connection
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Ensure required tables exist
db.exec(`
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	username TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	created_at TEXT NOT NULL
);
`);

module.exports = db;


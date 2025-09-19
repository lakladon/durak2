const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/sqlite');

async function registerUser(username, password) {
	const normalizedUsername = String(username || '').trim().toLowerCase();
	if (!normalizedUsername || normalizedUsername.length < 2) {
		throw new Error('USERNAME_INVALID');
	}
	if (!password || String(password).length < 6) {
		throw new Error('PASSWORD_INVALID');
	}
	const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(normalizedUsername);
	if (existing) {
		throw new Error('USERNAME_TAKEN');
	}
	const passwordHash = await bcrypt.hash(password, 10);
	const id = uuidv4();
	const createdAt = new Date().toISOString();
	db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)')
		.run(id, normalizedUsername, passwordHash, createdAt);
	return { id, username: normalizedUsername };
}

async function authenticateUser(username, password) {
	const normalizedUsername = String(username || '').trim().toLowerCase();
	const row = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(normalizedUsername);
	if (!row) {
		throw new Error('INVALID_CREDENTIALS');
	}
	const ok = await bcrypt.compare(password, row.password_hash);
	if (!ok) {
		throw new Error('INVALID_CREDENTIALS');
	}
	return { id: row.id, username: row.username };
}

function getUserById(userId) {
	const row = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
	return row ? { id: row.id, username: row.username } : null;
}

function getUserByUsername(username) {
	const normalizedUsername = String(username || '').trim().toLowerCase();
	const row = db.prepare('SELECT id, username FROM users WHERE username = ?').get(normalizedUsername);
	return row ? { id: row.id, username: row.username } : null;
}

function createToken(user) {
	const secret = process.env.JWT_SECRET || 'change-me-in-production';
	return jwt.sign({ sub: user.id, username: user.username }, secret, { expiresIn: '7d' });
}

function verifyToken(token) {
	const secret = process.env.JWT_SECRET || 'change-me-in-production';
	try {
		return jwt.verify(token, secret);
	} catch (e) {
		return null;
	}
}

module.exports = {
	registerUser,
	authenticateUser,
	getUserById,
	getUserByUsername,
	createToken,
	verifyToken
};


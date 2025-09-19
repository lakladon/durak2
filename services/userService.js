const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson, ensureDirectoryExists } = require('../utils/fileDb');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
ensureDirectoryExists(DATA_DIR);

function loadUsers() {
	return readJson(USERS_FILE, []);
}

function saveUsers(users) {
	writeJson(USERS_FILE, users);
}

async function registerUser(username, password) {
	const normalizedUsername = String(username || '').trim().toLowerCase();
	if (!normalizedUsername || normalizedUsername.length < 2) {
		throw new Error('USERNAME_INVALID');
	}
	if (!password || String(password).length < 6) {
		throw new Error('PASSWORD_INVALID');
	}
	const users = loadUsers();
	if (users.some(u => u.username === normalizedUsername)) {
		throw new Error('USERNAME_TAKEN');
	}
	const passwordHash = await bcrypt.hash(password, 10);
	const newUser = {
		id: uuidv4(),
		username: normalizedUsername,
		passwordHash,
		createdAt: new Date().toISOString()
	};
	users.push(newUser);
	saveUsers(users);
	return { id: newUser.id, username: newUser.username };
}

async function authenticateUser(username, password) {
	const normalizedUsername = String(username || '').trim().toLowerCase();
	const users = loadUsers();
	const user = users.find(u => u.username === normalizedUsername);
	if (!user) {
		throw new Error('INVALID_CREDENTIALS');
	}
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) {
		throw new Error('INVALID_CREDENTIALS');
	}
	return { id: user.id, username: user.username };
}

function getUserById(userId) {
	const users = loadUsers();
	const user = users.find(u => u.id === userId);
	return user ? { id: user.id, username: user.username } : null;
}

function getUserByUsername(username) {
	const users = loadUsers();
	const user = users.find(u => u.username === String(username || '').trim().toLowerCase());
	return user ? { id: user.id, username: user.username } : null;
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


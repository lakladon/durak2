const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(directoryPath) {
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath, { recursive: true });
	}
}

function readJson(filePath, fallback) {
	try {
		if (!fs.existsSync(filePath)) {
			return fallback;
		}
		const content = fs.readFileSync(filePath, 'utf-8');
		if (!content) return fallback;
		return JSON.parse(content);
	} catch (err) {
		console.error('Failed to read JSON file', filePath, err);
		return fallback;
	}
}

function writeJson(filePath, data) {
	try {
		ensureDirectoryExists(path.dirname(filePath));
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
	} catch (err) {
		console.error('Failed to write JSON file', filePath, err);
		throw err;
	}
}

module.exports = {
	ensureDirectoryExists,
	readJson,
	writeJson
};


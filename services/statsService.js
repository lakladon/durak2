const path = require('path');
const fs = require('fs');
const { readJson, writeJson, ensureDirectoryExists } = require('../utils/fileDb');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
ensureDirectoryExists(DATA_DIR);

function loadStats() {
	return readJson(STATS_FILE, {});
}

function saveStats(allStats) {
	writeJson(STATS_FILE, allStats);
}

function getPlayerStats(username) {
	const allStats = loadStats();
	const key = String(username || '').trim().toLowerCase();
	if (!allStats[key]) {
		allStats[key] = { gamesPlayed: 0, wins: 0, losses: 0, winRate: 0 };
	}
	return allStats[key];
}

function updatePlayerStats(username, won) {
	const key = String(username || '').trim().toLowerCase();
	
	// Use atomic file operations to prevent race conditions
	const lockFile = STATS_FILE + '.lock';
	const maxRetries = 10;
	const retryDelay = 50; // ms
	
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			// Try to acquire lock
			if (fs.existsSync(lockFile)) {
				// Lock exists, wait and retry
				if (attempt < maxRetries - 1) {
					// Synchronous sleep using busy wait
					const start = Date.now();
					while (Date.now() - start < retryDelay) {
						// Busy wait
					}
					continue;
				}
				throw new Error('Could not acquire lock after maximum retries');
			}
			
			// Create lock file
			fs.writeFileSync(lockFile, process.pid.toString());
			
			try {
				const allStats = loadStats();
				if (!allStats[key]) {
					allStats[key] = { gamesPlayed: 0, wins: 0, losses: 0, winRate: 0 };
				}
				const stats = allStats[key];
				stats.gamesPlayed += 1;
				if (won) {
					stats.wins += 1;
				} else {
					stats.losses += 1;
				}
				stats.winRate = stats.gamesPlayed > 0 ? Number(((stats.wins / stats.gamesPlayed) * 100).toFixed(1)) : 0;
				allStats[key] = stats;
				saveStats(allStats);
				return stats;
			} finally {
				// Always release lock
				if (fs.existsSync(lockFile)) {
					fs.unlinkSync(lockFile);
				}
			}
		} catch (err) {
			// Clean up lock file on error
			if (fs.existsSync(lockFile)) {
				try {
					fs.unlinkSync(lockFile);
				} catch (cleanupErr) {
					console.error('Failed to cleanup lock file:', cleanupErr);
				}
			}
			
			if (attempt === maxRetries - 1) {
				console.error('Failed to update player stats after maximum retries:', err);
				throw err;
			}
		}
	}
}

module.exports = {
	getPlayerStats,
	updatePlayerStats
};


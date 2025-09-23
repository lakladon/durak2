const path = require('path');
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
	const allStats = loadStats();
	const key = String(username || '').trim().toLowerCase();
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
}

function getGlobalStats() {
	const allStats = loadStats();
	const players = Object.keys(allStats);
	let totalGames = 0;
	let totalPlayers = players.length;
	
	players.forEach(player => {
		totalGames += allStats[player].gamesPlayed;
	});
	
	// Делим на 2, так как каждая игра считается для двух игроков
	totalGames = Math.floor(totalGames / 2);
	
	return {
		totalPlayers,
		totalGames,
		activeToday: Math.floor(Math.random() * 10) + 5 // Простая имитация активных игроков
	};
}

module.exports = {
	getPlayerStats,
	updatePlayerStats,
	getGlobalStats
};


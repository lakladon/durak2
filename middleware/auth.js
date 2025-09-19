const { verifyToken } = require('../services/userService');

function expressAuthMiddleware(req, res, next) {
	const authHeader = req.headers['authorization'] || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) {
		return res.status(401).json({ error: 'UNAUTHORIZED' });
	}
	const payload = verifyToken(token);
	if (!payload) {
		return res.status(401).json({ error: 'INVALID_TOKEN' });
	}
	req.user = { id: payload.sub, username: payload.username };
	next();
}

function socketIoAuthMiddleware(socket, next) {
	try {
		const token = socket.handshake.auth?.token || null;
		// Allow guests: if no token provided, proceed without attaching user
		if (!token) {
			socket.user = null;
			return next();
		}
		const payload = verifyToken(token);
		if (!payload) return next(new Error('INVALID_TOKEN'));
		socket.user = { id: payload.sub, username: payload.username };
		return next();
	} catch (e) {
		return next(new Error('AUTH_ERROR'));
	}
}

module.exports = {
	expressAuthMiddleware,
	socketIoAuthMiddleware
};


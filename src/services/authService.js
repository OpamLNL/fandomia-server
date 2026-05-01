const jwt = require('jsonwebtoken');
require('dotenv').config();

// Генерування токена для користувача
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

// Перевірка токена на валідність
const verifyToken = (token, isAccessToken = true) => {
    const secretKey = isAccessToken ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        return null;
    }
};

// Middleware для захисту маршрутів
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // Немає токена
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Недійсний токен
        }

        req.user = user;
        next();
    });
};

module.exports = {
    generateTokens,
    verifyToken,
    authenticateToken
};

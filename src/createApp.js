const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const handleRequest = require('./routes/endpointRouter');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/healthRoutes');
const { setupSwagger } = require('./swagger');
const { checkAndInitDatabase } = require('./migrations/db-checker');

let dbInitPromise = null;

function ensureDatabaseReady() {
    if (!dbInitPromise) {
        dbInitPromise = checkAndInitDatabase().catch((err) => {
            dbInitPromise = null;
            throw err;
        });
    }
    return dbInitPromise;
}

function parseAllowedOrigins() {
    const defaults = ['http://localhost:3000', 'http://localhost:5173'];
    const fromEnv = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    if (process.env.VERCEL_URL) {
        fromEnv.push(`https://${process.env.VERCEL_URL}`);
    }

    if (process.env.FRONTEND_URL) {
        fromEnv.push(process.env.FRONTEND_URL.trim());
    }

    return [...new Set([...defaults, ...fromEnv])];
}

function createApp() {
    const app = express();
    const allowedOrigins = parseAllowedOrigins();

    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });

    app.use(express.json());
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    app.use(healthRoutes);
    setupSwagger(app);

    app.use(async (req, res, next) => {
        try {
            await ensureDatabaseReady();
            next();
        } catch (err) {
            next(err);
        }
    });

    const imagesPath = path.resolve(__dirname, '..', 'public', 'images');
    app.use('/images', express.static(imagesPath));

    const { getUploadsRoot, isServerlessUploads } = require('./utils/uploadPaths');
    const uploadsPath = getUploadsRoot();
    if (!isServerlessUploads() || fs.existsSync(uploadsPath)) {
        app.use('/uploads', express.static(uploadsPath));
    }

    app.use(handleRequest);
    app.use('/routes/auth', authRoutes);

    app.use((err, req, res, next) => {
        if (res.headersSent) return next(err);
        console.error(err);

        if (req.path.startsWith('/api/') || req.path.startsWith('/routes/')) {
            return res.status(err.status || 500).json({ error: err.message || 'Помилка сервера' });
        }

        if (err.status === 401) {
            return res.status(401).sendFile(path.join(__dirname, '..', 'public', '404.html'));
        }

        next(err);
    });

    app.use((req, res) => {
        if (req.path.startsWith('/api/') || req.path.startsWith('/routes/')) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
    });

    return app;
}

module.exports = { createApp, ensureDatabaseReady };

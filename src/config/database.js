const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

function readSslCa() {
    const raw = process.env.DB_SSL_CA?.trim();
    if (!raw) return null;

    if (raw.includes('-----BEGIN')) {
        return raw.replace(/\\n/g, '\n');
    }

    const projectRoot = path.resolve(__dirname, '..', '..');
    const certPath = path.isAbsolute(raw) ? raw : path.resolve(projectRoot, raw);
    if (!fs.existsSync(certPath)) {
        throw new Error(`DB_SSL_CA файл не знайдено: ${certPath}`);
    }

    return fs.readFileSync(certPath);
}

const sslCa = readSslCa();
const poolConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 5 : 20,
    queueLimit: 0,
};

if (sslCa) {
    poolConfig.ssl = {
        ca: sslCa,
        rejectUnauthorized: true,
    };
}

const pool = mysql.createPool(poolConfig);

async function query(sql, params) {
    const [results] = await pool.query(sql, params);
    return results;
}

async function closePool() {
    await pool.end();
}

module.exports = {
    query,
    closePool,
};

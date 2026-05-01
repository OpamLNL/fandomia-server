const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

console.log("Initializing connection pool...");
console.log(`Host: ${process.env.DB_HOST}, Database: ${process.env.DB_DATABASE}`);

// ЧИТАЄМО CA ФАЙЛ ПРАВИЛЬНО
const caCert = fs.readFileSync(process.env.DB_SSL_CA);

// Створення пулу з'єднань
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    ssl: {
        ca: caCert,
        rejectUnauthorized: true
    }
});

console.log("Connection pool created successfully.");

// Перевірка підключення до бази даних
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Successfully connected to the database.");
        connection.release();
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
})();

// Функція для виконання запитів
async function query(sql, params) {
    console.log(`Executing SQL: ${sql}`);
    try {
        const [results] = await pool.query(sql, params);
        console.log("SQL executed successfully.");
        return results;
    } catch (error) {
        console.error("Error executing SQL:", error);
        throw error;
    }
}

// Функція для закриття пулу з'єднань
async function closePool() {
    console.log("Closing connection pool...");
    try {
        await pool.end();
        console.log("Connection pool closed.");
    } catch (error) {
        console.error("Error closing connection pool:", error);
    }
}

module.exports = {
    query,
    closePool
};

// Перевірка з'єднання та виконання простого запиту
(async () => {
    try {
        console.log("Testing database connection...");
        const result = await query('SELECT 1');
        console.log("Database connection test successful:", result);
    } catch (error) {
        console.error("Database connection test failed:", error);
    }
})();
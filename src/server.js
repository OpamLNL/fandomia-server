require('dotenv').config({ path: '../.env' });

const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const morgan = require('morgan');

const handleRequest = require('./routes/endpointRouter');
const authRoutes = require('./routes/auth');

const { closePool } = require('./config/database');
const { checkAndInitDatabase } = require('./migrations/db-checker');

// 👇
const initDb = require('./migrations/init-db');

// CORS
const allowedOrigins = [
    'http://localhost:3000',

];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// images
const imagesPath = path.resolve(__dirname, '..', 'public', 'images');
app.use('/images', express.static(imagesPath));


const uploadsPath = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));


// middleware
app.use(express.json());
app.use(morgan('combined'));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// routes
app.use(handleRequest);
app.use('/routes/auth', authRoutes);

const workRoutes = require('./routes/workRoutes');
app.use('/api/works', workRoutes);


///////////////// test
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = require('./swagger/swaggerOptions');

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// errors
app.use((err, req, res, next) => {
    if (err.status === 401) {
        res.status(401).sendFile(path.join(__dirname, '..', 'public', '404.html'));
    } else {
        next(err);
    }
});


app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});






// start
const PORT = process.env.PORT;
const ipAddress = process.env.DB_IP;
const server = http.createServer(app);

(async () => {
    // заповнення сідами
    await initDb({ drop: true, seed: true });

    // нормальна перевірка
    await checkAndInitDatabase();

    server.listen(PORT, ipAddress, () => {
        console.log(`===================================================`);
        console.log(`======== Fandomia Server is running on port:${PORT}`);
        console.log(`===================================================`);
    });
})();

// shutdown
process.on('SIGINT', async () => {
    try {
        await closePool();
        console.log('🔌 Відключено від БД');
        server.close(() => {
            console.log('🛑 Сервер зупинено');
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Помилка при відключенні від БД', error);
        process.exit(1);
    }
});
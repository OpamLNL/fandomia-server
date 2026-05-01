const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

function getSeedPath(jsonFile) {
    const pathFromSrc = path.join(__dirname, '../seed', jsonFile);
    const pathFromRoot = path.join(__dirname, '../../seed', jsonFile);

    if (fs.existsSync(pathFromSrc)) return pathFromSrc;
    if (fs.existsSync(pathFromRoot)) return pathFromRoot;

    throw new Error(`Не знайдено seed файл: ${jsonFile}`);
}

function seedExists(jsonFile) {
    const pathFromSrc = path.join(__dirname, '../seed', jsonFile);
    const pathFromRoot = path.join(__dirname, '../../seed', jsonFile);

    return fs.existsSync(pathFromSrc) || fs.existsSync(pathFromRoot);
}

async function dropTables() {
    console.log('🧨 Dropping tables...');

    await query('SET FOREIGN_KEY_CHECKS = 0');

    await query(`
        DROP TABLE IF EXISTS
            favorites,
            reports,
            likes,
            comments,
            chapters,
            work_images,
            post_tags,
            work_tags,
            posts,
            works,
            tags,
            fandoms,
            users
    `);

    await query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Tables dropped');
}

async function createTables() {
    console.log('📦 Creating tables...');

    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firebase_uid VARCHAR(128) UNIQUE,
            email VARCHAR(255),
            name VARCHAR(255),
            avatar_url TEXT,
            role ENUM('user','moderator','admin') DEFAULT 'user',
            is_blocked BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS fandoms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) UNIQUE,
            description TEXT,
            cover_image TEXT
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS tags (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS works (
                                             id INT AUTO_INCREMENT PRIMARY KEY,
                                             user_id INT,
                                             fandom_id INT,
                                             title VARCHAR(255),
            description TEXT,
            type ENUM('fanfic','art','theory','review','cosplay') DEFAULT 'fanfic',
            status ENUM('active','hidden','blocked') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (fandom_id) REFERENCES fandoms(id) ON DELETE CASCADE
            )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS work_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            work_id INT NOT NULL,
            image_path TEXT NOT NULL,
            order_index INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS chapters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            work_id INT NOT NULL,
            title VARCHAR(255),
            content_path TEXT NOT NULL,
            order_index INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS posts (
                                             id INT AUTO_INCREMENT PRIMARY KEY,
                                             user_id INT,
                                             fandom_id INT,
                                             title VARCHAR(255),
            content TEXT,
            type ENUM('discussion','question','news') DEFAULT 'discussion',
            status ENUM('active','hidden','blocked') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (fandom_id) REFERENCES fandoms(id) ON DELETE CASCADE
            )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS work_tags (
            work_id INT,
            tag_id INT,
            PRIMARY KEY (work_id, tag_id),
            FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS post_tags (
            post_id INT,
            tag_id INT,
            PRIMARY KEY (post_id, tag_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS comments (
                                                id INT AUTO_INCREMENT PRIMARY KEY,
                                                user_id INT,
                                                target_type ENUM('work','post') NOT NULL,
            target_id INT NOT NULL,
            content TEXT NOT NULL,
            status ENUM('active','hidden','blocked') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
    `);


    await query(`
        CREATE TABLE IF NOT EXISTS reports (
                                               id INT AUTO_INCREMENT PRIMARY KEY,
                                               reporter_id INT NOT NULL,
                                               target_type ENUM('work','post','comment','user') NOT NULL,
            target_id INT NOT NULL,
            reason TEXT NOT NULL,
            status ENUM('pending','reviewed','rejected','resolved') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
            )
    `);


    await query(`
        CREATE TABLE IF NOT EXISTS favorites (
                                                 user_id INT NOT NULL,
                                                 target_type ENUM('work','post') NOT NULL,
            target_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, target_type, target_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
    `);




    await query(`
        CREATE TABLE IF NOT EXISTS likes (
            user_id INT,
            target_type ENUM('work','post','comment') NOT NULL,
            target_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, target_type, target_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    console.log('✅ Tables created');
}

async function loadData(tableName, jsonFile) {
    const dataPath = getSeedPath(jsonFile);
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const items = JSON.parse(rawData);

    for (const item of items) {
        const keys = Object.keys(item);
        const values = Object.values(item);
        const placeholders = keys.map(() => '?').join(', ');

        await query(
            `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
            values
        );
    }

    console.log(`✅ ${tableName}: ${items.length} records`);
}

async function seedDatabase() {
    console.log('🌱 Seeding database...');

    await loadData('users', 'users.json');
    await loadData('fandoms', 'fandoms.json');
    await loadData('tags', 'tags.json');

    await loadData('works', 'works.json');
    await loadData('posts', 'posts.json');

    await loadData('work_tags', 'work_tags.json');
    await loadData('post_tags', 'post_tags.json');

    await loadData('comments', 'comments.json');

    if (seedExists('work_images.json')) {
        await loadData('work_images', 'work_images.json');
    }

    if (seedExists('chapters.json')) {
        await loadData('chapters', 'chapters.json');
    }

    if (seedExists('likes.json')) {
        await loadData('likes', 'likes.json');
    }

    console.log('✅ Database seeded');
}

async function init(options = { drop: true, seed: true }) {
    try {
        if (options.drop) {
            await dropTables();
        }

        await createTables();

        if (options.seed) {
            await seedDatabase();
        }

        console.log('🚀 Database initialized successfully');

        if (require.main === module) {
            process.exit(0);
        }
    } catch (err) {
        console.error('❌ Error during database initialization:', err);

        if (require.main === module) {
            process.exit(1);
        }

        throw err;
    }
}

module.exports = init;

if (require.main === module) {
    init({ drop: true, seed: true });
}
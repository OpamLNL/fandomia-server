// src/migrations/db-checker.js

const { query } = require('../config/database');
const init = require('./init-db');
const { ensureFollowsSchema } = require('./add-follows');
const { ensureNotificationsSchema } = require('./add-notifications');
const { ensureContentRatingSchema } = require('./add-content-rating');
const { ensureContactMessagesSchema } = require('./add-contact-messages');
const { ensureImgbbSchema } = require('./add-imgbb-fields');
const { ensureChapterContentSchema } = require('./add-chapter-content');
const { ensurePostWorkLinkSchema } = require('./add-post-work-link');

const REQUIRED_TABLES = [
    'users',
    'fandoms',
    'tags',
    'works',
    'posts',
    'work_tags',
    'post_tags',
    'comments'
];

async function checkAndInitDatabase() {
    try {
        const rows = await query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
            [process.env.DB_DATABASE]
        );

        const existing = rows.map(r => r.TABLE_NAME || r.table_name);
        const missing = REQUIRED_TABLES.filter(t => !existing.includes(t));

        if (missing.length > 0) {
            console.log(`🧱 Missing tables: ${missing.join(', ')} — running init...`);

            // викликаємо init БЕЗ process.exit
            await init({ drop: false, seed: false });

        } else {
            console.log('✅ All tables exist.');
        }

        await ensureFollowsSchema();
        await ensureNotificationsSchema();
        await ensureContentRatingSchema();
        await ensureContactMessagesSchema();
        await ensureImgbbSchema();
        await ensureChapterContentSchema();
        await ensurePostWorkLinkSchema();
    } catch (err) {
        console.error('❌ DB CHECK ERROR:', err);
        throw err;
    }
}

module.exports = { checkAndInitDatabase };
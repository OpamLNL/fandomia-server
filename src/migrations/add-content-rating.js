const { query } = require('../config/database');

async function columnExists(table, column) {
    const rows = await query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [process.env.DB_DATABASE, table, column]
    );
    return rows.length > 0;
}

async function ensureContentRatingSchema() {
    if (!(await columnExists('works', 'content_rating'))) {
        await query(`
            ALTER TABLE works
            ADD COLUMN content_rating ENUM('general','mature') NOT NULL DEFAULT 'general'
        `);
        console.log('✅ Added works.content_rating');
    }

    if (!(await columnExists('posts', 'content_rating'))) {
        await query(`
            ALTER TABLE posts
            ADD COLUMN content_rating ENUM('general','mature') NOT NULL DEFAULT 'general'
        `);
        console.log('✅ Added posts.content_rating');
    }

    if (!(await columnExists('users', 'show_mature_content'))) {
        await query(`
            ALTER TABLE users
            ADD COLUMN show_mature_content BOOLEAN NOT NULL DEFAULT FALSE
        `);
        console.log('✅ Added users.show_mature_content');
    }

    if (!(await columnExists('users', 'mature_confirmed_at'))) {
        await query(`
            ALTER TABLE users
            ADD COLUMN mature_confirmed_at TIMESTAMP NULL DEFAULT NULL
        `);
        console.log('✅ Added users.mature_confirmed_at');
    }
}

module.exports = { ensureContentRatingSchema };

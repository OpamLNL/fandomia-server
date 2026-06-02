const { query } = require('../config/database');

async function columnExists(table, column) {
    const rows = await query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [process.env.DB_DATABASE, table, column]
    );
    return rows.length > 0;
}

async function ensureChapterContentSchema() {
    if (!(await columnExists('chapters', 'content'))) {
        await query(`ALTER TABLE chapters ADD COLUMN content MEDIUMTEXT NULL`);
        console.log('✅ Added chapters.content');
    }
}

module.exports = { ensureChapterContentSchema };

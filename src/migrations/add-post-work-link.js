const { query } = require('../config/database');

async function columnExists(table, column) {
    const rows = await query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [process.env.DB_DATABASE, table, column]
    );
    return rows.length > 0;
}

async function ensurePostWorkLinkSchema() {
    if (!(await columnExists('posts', 'work_id'))) {
        await query(`
            ALTER TABLE posts
            ADD COLUMN work_id INT NULL,
            ADD CONSTRAINT fk_posts_work FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE SET NULL
        `);
        console.log('✅ Added posts.work_id');
    }
}

module.exports = { ensurePostWorkLinkSchema };

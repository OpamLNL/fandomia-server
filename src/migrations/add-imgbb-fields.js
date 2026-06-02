const { query } = require('../config/database');

async function columnExists(table, column) {
    const rows = await query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [process.env.DB_DATABASE, table, column]
    );
    return rows.length > 0;
}

async function ensureImgbbSchema() {
    if (!(await columnExists('work_images', 'delete_url'))) {
        await query(`ALTER TABLE work_images ADD COLUMN delete_url TEXT NULL`);
        console.log('✅ Added work_images.delete_url');
    }

    if (!(await columnExists('users', 'avatar_delete_url'))) {
        await query(`ALTER TABLE users ADD COLUMN avatar_delete_url TEXT NULL`);
        console.log('✅ Added users.avatar_delete_url');
    }
}

module.exports = { ensureImgbbSchema };

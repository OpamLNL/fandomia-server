const { query } = require('../config/database');

const getChaptersByWorkId = async (workId) => {
    return await query(`
        SELECT *
        FROM chapters
        WHERE work_id = ?
        ORDER BY order_index ASC
    `, [workId]);
};

const getChapterById = async (id) => {
    const rows = await query(`
        SELECT *
        FROM chapters
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const createChapter = async ({ work_id, title, content_path, order_index }) => {
    const result = await query(`
        INSERT INTO chapters (work_id, title, content_path, order_index)
        VALUES (?, ?, ?, ?)
    `, [
        work_id,
        title || null,
        content_path,
        order_index || 0
    ]);

    return {
        id: result.insertId,
        work_id,
        title,
        content_path,
        order_index: order_index || 0
    };
};

const updateChapter = async (id, { title, content_path, order_index }) => {
    await query(`
        UPDATE chapters
        SET title = ?, content_path = ?, order_index = ?
        WHERE id = ?
    `, [
        title || null,
        content_path,
        order_index || 0,
        id
    ]);

    return {
        id,
        title,
        content_path,
        order_index: order_index || 0
    };
};

const deleteChapter = async (id) => {
    await query(`
        DELETE FROM chapters
        WHERE id = ?
    `, [id]);

    return { id };
};

module.exports = {
    getChaptersByWorkId,
    getChapterById,
    createChapter,
    updateChapter,
    deleteChapter
};
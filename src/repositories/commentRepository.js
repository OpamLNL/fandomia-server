const { query } = require('../config/database');

const getCommentsByTarget = async (type, id) => {
    return await query(`
        SELECT *
        FROM comments
        WHERE target_type = ? AND target_id = ? AND status = 'active'
        ORDER BY created_at ASC
    `, [type, id]);
};

const getCommentById = async (id) => {
    const rows = await query(`
        SELECT *
        FROM comments
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const createComment = async (data) => {
    const result = await query(`
        INSERT INTO comments (user_id, target_type, target_id, content, status)
        VALUES (?, ?, ?, ?, 'active')
    `, [
        data.user_id,
        data.target_type,
        data.target_id,
        data.content
    ]);

    return { id: result.insertId };
};

const updateComment = async (id, content) => {
    await query(`
        UPDATE comments
        SET content = ?
        WHERE id = ?
    `, [content, id]);

    return { id };
};

const updateCommentStatus = async (id, status) => {
    await query(`
        UPDATE comments
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const deleteComment = async (id) => {
    await query(`DELETE FROM comments WHERE id = ?`, [id]);
};

module.exports = {
    getCommentsByTarget,
    getCommentById,
    createComment,
    updateComment,
    updateCommentStatus,
    deleteComment
};
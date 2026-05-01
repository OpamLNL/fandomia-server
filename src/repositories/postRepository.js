const { query } = require('../config/database');

const getAllPosts = async () => {
    return await query(`
        SELECT *
        FROM posts
        WHERE status = 'active'
        ORDER BY created_at DESC
    `);
};

const getPostById = async (id) => {
    const rows = await query(`
        SELECT *
        FROM posts
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const getPostsByUserId = async (userId) => {
    return await query(`
        SELECT *
        FROM posts
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [userId]);
};

const createPost = async (data) => {
    const result = await query(`
        INSERT INTO posts (user_id, fandom_id, title, content, type, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    `, [
        data.user_id,
        data.fandom_id,
        data.title,
        data.content,
        data.type || 'discussion'
    ]);

    return { id: result.insertId };
};

const updatePost = async (id, data) => {
    await query(`
        UPDATE posts
        SET title = ?, content = ?, type = ?
        WHERE id = ?
    `, [
        data.title,
        data.content,
        data.type,
        id
    ]);

    return { id };
};

const updatePostStatus = async (id, status) => {
    await query(`
        UPDATE posts
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const deletePost = async (id) => {
    await query(`DELETE FROM posts WHERE id = ?`, [id]);
};

module.exports = {
    getAllPosts,
    getPostById,
    getPostsByUserId,
    createPost,
    updatePost,
    updatePostStatus,
    deletePost
};
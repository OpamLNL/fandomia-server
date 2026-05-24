const { query } = require('../config/database');
const { matureOnlySql } = require('../utils/contentRating');

const getAllPosts = async (showMature = false) => {
    return await query(`
        SELECT
            p.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            f.name AS fandom_name
        FROM posts p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE p.status = 'active'${matureOnlySql('p', showMature)}
        ORDER BY p.created_at DESC
    `);
};

const getPostById = async (id) => {
    const rows = await query(`
        SELECT
            p.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            f.name AS fandom_name
        FROM posts p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE p.id = ?
    `, [id]);

    return rows[0];
};

const getPostsByUserId = async (userId) => {
    return await query(`
        SELECT
            p.*,
            f.name AS fandom_name
        FROM posts p
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    `, [userId]);
};

const getPostsByFandomId = async (fandomId, showMature = false) => {
    return await query(`
        SELECT
            p.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar
        FROM posts p
                 LEFT JOIN users u ON p.user_id = u.id
        WHERE p.fandom_id = ? AND p.status = 'active'${matureOnlySql('p', showMature)}
        ORDER BY p.created_at DESC
    `, [fandomId]);
};

const getPostsByType = async (type, showMature = false) => {
    return await query(`
        SELECT
            p.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM posts p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE p.type = ? AND p.status = 'active'${matureOnlySql('p', showMature)}
        ORDER BY p.created_at DESC
    `, [type]);
};

const searchPosts = async (searchQuery, showMature = false) => {
    return await query(`
        SELECT
            p.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM posts p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE p.status = 'active'${matureOnlySql('p', showMature)}
          AND (p.title LIKE ? OR p.content LIKE ?)
        ORDER BY p.created_at DESC
    `, [`%${searchQuery}%`, `%${searchQuery}%`]);
};

const getPostsByTagId = async (tagId, showMature = false) => {
    return await query(`
        SELECT
            p.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM posts p
                 JOIN post_tags pt ON p.id = pt.post_id
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE pt.tag_id = ? AND p.status = 'active'${matureOnlySql('p', showMature)}
        ORDER BY p.created_at DESC
    `, [tagId]);
};

const getLatestPosts = async (limit = 10, showMature = false) => {
    return await query(`
        SELECT
            p.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            f.name AS fandom_name
        FROM posts p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE p.status = 'active'${matureOnlySql('p', showMature)}
        ORDER BY p.created_at DESC
        LIMIT ?
    `, [Number(limit) || 10]);
};

const getPostTags = async (postId) => {
    return await query(`
        SELECT t.*
        FROM tags t
                 JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
        ORDER BY t.name ASC
    `, [postId]);
};

const addPostTag = async (postId, tagId) => {
    await query(
        `INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
        [postId, tagId]
    );
    return { post_id: postId, tag_id: tagId };
};

const deletePostTags = async (postId) => {
    await query(`DELETE FROM post_tags WHERE post_id = ?`, [postId]);
    return { post_id: postId };
};

const createPost = async (data) => {
    const result = await query(`
        INSERT INTO posts (user_id, fandom_id, title, content, type, content_rating, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, [
        data.user_id,
        data.fandom_id,
        data.title,
        data.content,
        data.type || 'discussion',
        data.content_rating || 'general',
    ]);

    return { id: result.insertId };
};

const updatePost = async (id, data) => {
    await query(`
        UPDATE posts
        SET fandom_id = ?, title = ?, content = ?, type = ?, content_rating = ?
        WHERE id = ?
    `, [
        data.fandom_id,
        data.title,
        data.content,
        data.type,
        data.content_rating || 'general',
        id,
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
    return { id };
};

module.exports = {
    getAllPosts,
    getPostById,
    getPostsByUserId,
    getPostsByFandomId,
    getPostsByType,
    getPostsByTagId,
    searchPosts,
    getLatestPosts,
    getPostTags,
    addPostTag,
    deletePostTags,
    createPost,
    updatePost,
    updatePostStatus,
    deletePost
};

const { query } = require('../config/database');

const getAllUsers = async () => {
    return await query(`
        SELECT *
        FROM users
        ORDER BY created_at DESC
    `);
};

const getUserById = async (id) => {
    const rows = await query(`
        SELECT *
        FROM users
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const getUserByFirebaseUid = async (firebaseUid) => {
    const rows = await query(`
        SELECT *
        FROM users
        WHERE firebase_uid = ?
    `, [firebaseUid]);

    return rows[0];
};

const getUserByEmail = async (email) => {
    const rows = await query(`
        SELECT *
        FROM users
        WHERE email = ?
    `, [email]);

    return rows[0];
};

const searchUsers = async (searchQuery) => {
    return await query(`
        SELECT *
        FROM users
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY name ASC
    `, [`%${searchQuery}%`, `%${searchQuery}%`]);
};

const getUserWorks = async (userId) => {
    return await query(`
        SELECT
            w.*,
            f.name AS fandom_name
        FROM works w
                 LEFT JOIN fandoms f ON w.fandom_id = f.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `, [userId]);
};

const getUserPosts = async (userId) => {
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

const getUserComments = async (userId) => {
    return await query(`
        SELECT *
        FROM comments
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [userId]);
};

const getUserStats = async (userId) => {
    const works = await query(`
        SELECT COUNT(*) AS count
        FROM works
        WHERE user_id = ?
    `, [userId]);

    const posts = await query(`
        SELECT COUNT(*) AS count
        FROM posts
        WHERE user_id = ?
    `, [userId]);

    const comments = await query(`
        SELECT COUNT(*) AS count
        FROM comments
        WHERE user_id = ?
    `, [userId]);

    const likes = await query(`
        SELECT COUNT(*) AS count
        FROM likes
        WHERE user_id = ?
    `, [userId]);

    return {
        works_count: works[0].count,
        posts_count: posts[0].count,
        comments_count: comments[0].count,
        likes_count: likes[0].count
    };
};

const createUser = async (data) => {
    const {
        firebase_uid,
        email,
        name,
        avatar_url,
        role
    } = data;

    const result = await query(`
        INSERT INTO users (firebase_uid, email, name, avatar_url, role, is_blocked)
        VALUES (?, ?, ?, ?, ?, FALSE)
    `, [
        firebase_uid,
        email || null,
        name || null,
        avatar_url || null,
        role || 'user'
    ]);

    return {
        id: result.insertId,
        firebase_uid,
        email,
        name,
        avatar_url,
        role: role || 'user',
        is_blocked: false
    };
};

const updateUser = async (id, data) => {
    const {
        email,
        name,
        avatar_url
    } = data;

    await query(`
        UPDATE users
        SET email = ?, name = ?, avatar_url = ?
        WHERE id = ?
    `, [
        email || null,
        name || null,
        avatar_url || null,
        id
    ]);

    return {
        id,
        email,
        name,
        avatar_url
    };
};

const updateUserRole = async (id, role) => {
    await query(`
        UPDATE users
        SET role = ?
        WHERE id = ?
    `, [role, id]);

    return {
        id,
        role
    };
};

const updateUserBlockedStatus = async (id, isBlocked) => {
    await query(`
        UPDATE users
        SET is_blocked = ?
        WHERE id = ?
    `, [Boolean(isBlocked), id]);

    return {
        id,
        is_blocked: Boolean(isBlocked)
    };
};

const deleteUser = async (id) => {
    await query(`
        DELETE FROM users
        WHERE id = ?
    `, [id]);

    return { id };
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByFirebaseUid,
    getUserByEmail,
    searchUsers,
    getUserWorks,
    getUserPosts,
    getUserComments,
    getUserStats,
    createUser,
    updateUser,
    updateUserRole,
    updateUserBlockedStatus,
    deleteUser
};
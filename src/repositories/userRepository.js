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

const getReceivedComments = async (userId, limit = 50) => {
    return query(
        `SELECT
            c.id,
            c.content,
            c.target_type,
            c.target_id,
            c.status,
            c.created_at,
            c.user_id AS author_id,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            CASE
                WHEN c.target_type = 'work' THEN w.title
                WHEN c.target_type = 'post' THEN p.title
            END AS target_title
         FROM comments c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN works w ON c.target_type = 'work' AND c.target_id = w.id
         LEFT JOIN posts p ON c.target_type = 'post' AND c.target_id = p.id
         WHERE c.status = 'active'
           AND c.user_id != ?
           AND (
               (c.target_type = 'work' AND w.user_id = ?)
               OR (c.target_type = 'post' AND p.user_id = ?)
           )
         ORDER BY c.created_at DESC
         LIMIT ?`,
        [userId, userId, userId, limit]
    );
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

    const likesReceived = await query(`
        SELECT COUNT(*) AS count
        FROM likes l
        WHERE (l.target_type = 'work' AND l.target_id IN (
            SELECT id FROM works WHERE user_id = ?
        ))
        OR (l.target_type = 'post' AND l.target_id IN (
            SELECT id FROM posts WHERE user_id = ?
        ))
        OR (l.target_type = 'comment' AND l.target_id IN (
            SELECT id FROM comments WHERE user_id = ?
        ))
    `, [userId, userId, userId]);

    const favorites = await query(`
        SELECT COUNT(*) AS count
        FROM favorites
        WHERE user_id = ?
    `, [userId]);

    const followers = await query(`
        SELECT COUNT(*) AS count
        FROM user_follows
        WHERE following_id = ?
    `, [userId]);

    const following = await query(`
        SELECT COUNT(*) AS count
        FROM user_follows
        WHERE follower_id = ?
    `, [userId]);

    return {
        works_count: Number(works[0].count ?? 0),
        posts_count: Number(posts[0].count ?? 0),
        comments_count: Number(comments[0].count ?? 0),
        likes_count: Number(likes[0].count ?? 0),
        likes_received_count: Number(likesReceived[0].count ?? 0),
        favorites_count: Number(favorites[0].count ?? 0),
        followers_count: Number(followers[0].count ?? 0),
        following_count: Number(following[0].count ?? 0),
    };
};

const getPopularAuthors = async (limit = 3) => {
    return query(
        `SELECT
            u.id,
            u.name,
            u.avatar_url,
            (SELECT COUNT(*) FROM works w WHERE w.user_id = u.id AND w.status = 'active') AS works_count,
            (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.status = 'active') AS posts_count,
            (
                SELECT COUNT(*)
                FROM likes l
                WHERE (l.target_type = 'work' AND l.target_id IN (
                    SELECT id FROM works w2 WHERE w2.user_id = u.id AND w2.status = 'active'
                ))
                OR (l.target_type = 'post' AND l.target_id IN (
                    SELECT id FROM posts p2 WHERE p2.user_id = u.id AND p2.status = 'active'
                ))
            ) AS likes_received_count
         FROM users u
         WHERE (u.is_blocked = FALSE OR u.is_blocked IS NULL)
           AND (
               EXISTS (SELECT 1 FROM works w WHERE w.user_id = u.id AND w.status = 'active')
               OR EXISTS (SELECT 1 FROM posts p WHERE p.user_id = u.id AND p.status = 'active')
           )
         ORDER BY likes_received_count DESC, works_count DESC, posts_count DESC
         LIMIT ?`,
        [limit]
    );
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
        avatar_url,
        show_mature_content,
    } = data;

    const fields = ['email = ?', 'name = ?', 'avatar_url = ?'];
    const values = [email || null, name || null, avatar_url || null];

    if (show_mature_content !== undefined) {
        fields.push('show_mature_content = ?', 'mature_confirmed_at = ?');
        values.push(Boolean(show_mature_content));
        values.push(show_mature_content ? new Date() : null);
    }

    values.push(id);

    await query(`
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = ?
    `, values);

    return {
        id,
        email,
        name,
        avatar_url,
        ...(show_mature_content !== undefined
            ? { show_mature_content: Boolean(show_mature_content) }
            : {}),
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
    getReceivedComments,
    getUserStats,
    getPopularAuthors,
    createUser,
    updateUser,
    updateUserRole,
    updateUserBlockedStatus,
    deleteUser
};
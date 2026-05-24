const { query } = require('../config/database');

const getFollow = async (followerId, followingId) => {
    const rows = await query(
        `SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?`,
        [followerId, followingId]
    );
    return rows[0];
};

const createFollow = async (followerId, followingId) => {
    await query(
        `INSERT IGNORE INTO user_follows (follower_id, following_id) VALUES (?, ?)`,
        [followerId, followingId]
    );
    return { follower_id: followerId, following_id: followingId };
};

const deleteFollow = async (followerId, followingId) => {
    await query(
        `DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?`,
        [followerId, followingId]
    );
    return { follower_id: followerId, following_id: followingId };
};

const getFollowingIds = async (followerId) => {
    const rows = await query(
        `SELECT following_id FROM user_follows WHERE follower_id = ?`,
        [followerId]
    );
    return rows.map((row) => row.following_id);
};

const getFollowingUsers = async (followerId) => {
    return query(
        `SELECT u.id, u.name, u.avatar_url, u.role, uf.created_at AS followed_at
         FROM user_follows uf
         JOIN users u ON u.id = uf.following_id
         WHERE uf.follower_id = ?
         ORDER BY uf.created_at DESC`,
        [followerId]
    );
};

const getFollowersCount = async (userId) => {
    const rows = await query(
        `SELECT COUNT(*) AS count FROM user_follows WHERE following_id = ?`,
        [userId]
    );
    return rows[0].count;
};

const getFollowingCount = async (userId) => {
    const rows = await query(
        `SELECT COUNT(*) AS count FROM user_follows WHERE follower_id = ?`,
        [userId]
    );
    return rows[0].count;
};

const getFeedLastSeenAt = async (userId) => {
    const rows = await query(
        `SELECT feed_last_seen_at, created_at FROM users WHERE id = ?`,
        [userId]
    );
    return rows[0];
};

const markFeedSeen = async (userId) => {
    await query(
        `UPDATE users SET feed_last_seen_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [userId]
    );
};

const getFeedActivity = async (followerId, since) => {
    const followingIds = await getFollowingIds(followerId);
    if (followingIds.length === 0) {
        return { works: [], posts: [], comments: [] };
    }

    const placeholders = followingIds.map(() => '?').join(',');

    const works = await query(
        `SELECT w.id, w.title, w.type, w.created_at,
                u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar
         FROM works w
         JOIN users u ON u.id = w.user_id
         WHERE w.user_id IN (${placeholders})
           AND w.status = 'active'
           AND w.created_at > ?
         ORDER BY w.created_at DESC
         LIMIT 50`,
        [...followingIds, since]
    );

    const posts = await query(
        `SELECT p.id, p.title, p.content, p.created_at,
                u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar
         FROM posts p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id IN (${placeholders})
           AND p.status = 'active'
           AND p.created_at > ?
         ORDER BY p.created_at DESC
         LIMIT 50`,
        [...followingIds, since]
    );

    const comments = await query(
        `SELECT c.id, c.content, c.target_type, c.target_id, c.created_at,
                u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.user_id IN (${placeholders})
           AND c.status = 'active'
           AND c.created_at > ?
         ORDER BY c.created_at DESC
         LIMIT 50`,
        [...followingIds, since]
    );

    return { works, posts, comments };
};

module.exports = {
    getFollow,
    createFollow,
    deleteFollow,
    getFollowingIds,
    getFollowingUsers,
    getFollowersCount,
    getFollowingCount,
    getFeedLastSeenAt,
    markFeedSeen,
    getFeedActivity,
};

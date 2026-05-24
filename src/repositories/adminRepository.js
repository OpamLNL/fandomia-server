const { query } = require('../config/database');

const getStats = async () => {
    const users = await query(`SELECT COUNT(*) AS count FROM users`);
    const works = await query(`SELECT COUNT(*) AS count FROM works`);
    const posts = await query(`SELECT COUNT(*) AS count FROM posts`);
    const comments = await query(`SELECT COUNT(*) AS count FROM comments`);
    const reports = await query(`SELECT COUNT(*) AS count FROM reports`);
    const pendingReports = await query(`SELECT COUNT(*) AS count FROM reports WHERE status = 'pending'`);

    return {
        users_count: users[0].count,
        works_count: works[0].count,
        posts_count: posts[0].count,
        comments_count: comments[0].count,
        reports_count: reports[0].count,
        pending_reports_count: pendingReports[0].count
    };
};

const getUsers = async () => {
    return await query(`
        SELECT id, firebase_uid, email, name, avatar_url, role, is_blocked, created_at
        FROM users
        ORDER BY created_at DESC
    `);
};

const searchUsers = async (searchQuery) => {
    return await query(`
        SELECT id, firebase_uid, email, name, avatar_url, role, is_blocked, created_at
        FROM users
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY created_at DESC
    `, [`%${searchQuery}%`, `%${searchQuery}%`]);
};

const updateUserRole = async (id, role) => {
    await query(`
        UPDATE users
        SET role = ?
        WHERE id = ?
    `, [role, id]);

    return { id, role };
};

const updateUserBlockedStatus = async (id, isBlocked) => {
    await query(`
        UPDATE users
        SET is_blocked = ?
        WHERE id = ?
    `, [Boolean(isBlocked), id]);

    return { id, is_blocked: Boolean(isBlocked) };
};

const deleteUser = async (id) => {
    await query(`DELETE FROM users WHERE id = ?`, [id]);
    return { id };
};

const updateWorkStatus = async (id, status) => {
    await query(`
        UPDATE works
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const updatePostStatus = async (id, status) => {
    await query(`
        UPDATE posts
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const updateCommentStatus = async (id, status) => {
    await query(`
        UPDATE comments
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const deleteWork = async (id) => {
    await query(`DELETE FROM works WHERE id = ?`, [id]);
    return { id };
};

const deletePost = async (id) => {
    await query(`DELETE FROM posts WHERE id = ?`, [id]);
    return { id };
};

const deleteComment = async (id) => {
    await query(`DELETE FROM comments WHERE id = ?`, [id]);
    return { id };
};

const getReports = async () => {
    return await query(`
        SELECT 
            r.*,
            u.name AS reporter_name,
            u.avatar_url AS reporter_avatar
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        ORDER BY r.created_at DESC
    `);
};

const getReportsByStatus = async (status) => {
    return await query(`
        SELECT 
            r.*,
            u.name AS reporter_name,
            u.avatar_url AS reporter_avatar
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        WHERE r.status = ?
        ORDER BY r.created_at DESC
    `, [status]);
};

const getAdminWorks = async () => {
    return await query(`
        SELECT
            w.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM works w
                 LEFT JOIN users u ON w.user_id = u.id
                 LEFT JOIN fandoms f ON w.fandom_id = f.id
        ORDER BY w.created_at DESC
    `);
};

const getAdminPosts = async () => {
    return await query(`
        SELECT
            p.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM posts p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN fandoms f ON p.fandom_id = f.id
        ORDER BY p.created_at DESC
    `);
};

const getAdminComments = async () => {
    return await query(`
        SELECT
            c.*,
            u.name AS author_name
        FROM comments c
                 LEFT JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
    `);
};

const updateReportStatus = async (id, status) => {
    await query(`
        UPDATE reports
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const deleteReport = async (id) => {
    await query(`DELETE FROM reports WHERE id = ?`, [id]);
    return { id };
};

module.exports = {
    getStats,
    getUsers,
    searchUsers,
    updateUserRole,
    updateUserBlockedStatus,
    deleteUser,
    updateWorkStatus,
    updatePostStatus,
    updateCommentStatus,
    deleteWork,
    deletePost,
    deleteComment,
    getReports,
    getReportsByStatus,
    getAdminWorks,
    getAdminPosts,
    getAdminComments,
    updateReportStatus,
    deleteReport
};
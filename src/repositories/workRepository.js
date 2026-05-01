const { query } = require('../config/database');

const getAllWorks = async (limit = 10, offset = 0) => {
    return await query(`
        SELECT
            w.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            f.name AS fandom_name
        FROM works w
                 LEFT JOIN users u ON w.user_id = u.id
                 LEFT JOIN fandoms f ON w.fandom_id = f.id
        WHERE w.status = 'active'
        ORDER BY w.created_at DESC
            LIMIT ? OFFSET ?
    `, [limit, offset]);
};

const countWorks = async () => {
    const rows = await query(`
        SELECT COUNT(*) AS count
        FROM works
        WHERE status = 'active'
    `);

    return rows[0].count;
};

const getWorkById = async (id) => {
    const rows = await query(`
        SELECT
            w.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            f.name AS fandom_name
        FROM works w
                 LEFT JOIN users u ON w.user_id = u.id
                 LEFT JOIN fandoms f ON w.fandom_id = f.id
        WHERE w.id = ?
    `, [id]);

    return rows[0];
};

const getWorksByUserId = async (userId) => {
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

const getWorksByFandomId = async (fandomId) => {
    return await query(`
        SELECT
            w.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar
        FROM works w
                 LEFT JOIN users u ON w.user_id = u.id
        WHERE w.fandom_id = ? AND w.status = 'active'
        ORDER BY w.created_at DESC
    `, [fandomId]);
};

const getWorksByType = async (type) => {
    return await query(`
        SELECT
            w.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM works w
                 LEFT JOIN users u ON w.user_id = u.id
                 LEFT JOIN fandoms f ON w.fandom_id = f.id
        WHERE w.type = ? AND w.status = 'active'
        ORDER BY w.created_at DESC
    `, [type]);
};

const searchWorks = async (searchQuery) => {
    return await query(`
        SELECT
            w.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM works w
                 LEFT JOIN users u ON w.user_id = u.id
                 LEFT JOIN fandoms f ON w.fandom_id = f.id
        WHERE w.status = 'active'
          AND (w.title LIKE ? OR w.description LIKE ?)
        ORDER BY w.created_at DESC
    `, [`%${searchQuery}%`, `%${searchQuery}%`]);
};

const getWorksByTagId = async (tagId) => {
    return await query(`
        SELECT
            w.*,
            u.name AS author_name,
            f.name AS fandom_name
        FROM works w
                 JOIN work_tags wt ON w.id = wt.work_id
                 LEFT JOIN users u ON w.user_id = u.id
                 LEFT JOIN fandoms f ON w.fandom_id = f.id
        WHERE wt.tag_id = ? AND w.status = 'active'
        ORDER BY w.created_at DESC
    `, [tagId]);
};

const getWorkImages = async (workId) => {
    return await query(`
        SELECT *
        FROM work_images
        WHERE work_id = ?
        ORDER BY order_index ASC
    `, [workId]);
};

const getWorkTags = async (workId) => {
    return await query(`
        SELECT t.*
        FROM tags t
                 JOIN work_tags wt ON t.id = wt.tag_id
        WHERE wt.work_id = ?
        ORDER BY t.name ASC
    `, [workId]);
};

const createWork = async (data) => {
    const { user_id, fandom_id, title, description, type } = data;

    const result = await query(`
        INSERT INTO works (user_id, fandom_id, title, description, type, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    `, [
        user_id,
        fandom_id,
        title,
        description || null,
        type || 'fanfic'
    ]);

    return {
        id: result.insertId,
        user_id,
        fandom_id,
        title,
        description,
        type: type || 'fanfic',
        status: 'active'
    };
};

const addWorkImage = async (workId, imagePath, orderIndex = 0) => {
    const result = await query(`
        INSERT INTO work_images (work_id, image_path, order_index)
        VALUES (?, ?, ?)
    `, [workId, imagePath, orderIndex]);

    return {
        id: result.insertId,
        work_id: workId,
        image_path: imagePath,
        order_index: orderIndex
    };
};

const updateWork = async (id, data) => {
    const { fandom_id, title, description, type } = data;

    await query(`
        UPDATE works
        SET fandom_id = ?, title = ?, description = ?, type = ?
        WHERE id = ?
    `, [
        fandom_id,
        title,
        description || null,
        type || 'fanfic',
        id
    ]);

    return {
        id,
        fandom_id,
        title,
        description,
        type: type || 'fanfic'
    };
};

const updateWorkStatus = async (id, status) => {
    await query(`
        UPDATE works
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const deleteWork = async (id) => {
    await query(`
        DELETE FROM works
        WHERE id = ?
    `, [id]);

    return { id };
};

module.exports = {
    getAllWorks,
    countWorks,
    getWorkById,
    getWorksByUserId,
    getWorksByFandomId,
    getWorksByType,
    searchWorks,
    getWorksByTagId,
    getWorkImages,
    getWorkTags,
    createWork,
    addWorkImage,
    updateWork,
    updateWorkStatus,
    deleteWork
};
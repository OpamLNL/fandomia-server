const { query } = require('../config/database');

const getAllTags = async () => {
    return await query(`
        SELECT 
            t.*,
            COUNT(DISTINCT wt.work_id) AS works_count,
            COUNT(DISTINCT pt.post_id) AS posts_count,
            COUNT(DISTINCT wt.work_id) + COUNT(DISTINCT pt.post_id) AS usage_count
        FROM tags t
        LEFT JOIN work_tags wt ON t.id = wt.tag_id
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        GROUP BY t.id, t.name
        ORDER BY t.name ASC
    `);
};

const getPopularTags = async () => {
    return await query(`
        SELECT 
            t.*,
            COUNT(DISTINCT wt.work_id) AS works_count,
            COUNT(DISTINCT pt.post_id) AS posts_count,
            COUNT(DISTINCT wt.work_id) + COUNT(DISTINCT pt.post_id) AS usage_count
        FROM tags t
        LEFT JOIN work_tags wt ON t.id = wt.tag_id
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        GROUP BY t.id, t.name
        ORDER BY usage_count DESC, t.name ASC
        LIMIT 20
    `);
};

const getTagById = async (id) => {
    const rows = await query(`
        SELECT 
            t.*,
            COUNT(DISTINCT wt.work_id) AS works_count,
            COUNT(DISTINCT pt.post_id) AS posts_count,
            COUNT(DISTINCT wt.work_id) + COUNT(DISTINCT pt.post_id) AS usage_count
        FROM tags t
        LEFT JOIN work_tags wt ON t.id = wt.tag_id
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        WHERE t.id = ?
        GROUP BY t.id, t.name
    `, [id]);

    return rows[0];
};

const searchTags = async (searchQuery) => {
    return await query(`
        SELECT 
            t.*,
            COUNT(DISTINCT wt.work_id) AS works_count,
            COUNT(DISTINCT pt.post_id) AS posts_count,
            COUNT(DISTINCT wt.work_id) + COUNT(DISTINCT pt.post_id) AS usage_count
        FROM tags t
        LEFT JOIN work_tags wt ON t.id = wt.tag_id
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        WHERE t.name LIKE ?
        GROUP BY t.id, t.name
        ORDER BY t.name ASC
    `, [`%${searchQuery}%`]);
};

const getTagWorks = async (tagId) => {
    return await query(`
        SELECT 
            w.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            f.name AS fandom_name
        FROM works w
        JOIN work_tags wt ON w.id = wt.work_id
        LEFT JOIN users u ON w.user_id = u.id
        LEFT JOIN fandoms f ON w.fandom_id = f.id
        WHERE wt.tag_id = ?
        ORDER BY w.created_at DESC
    `, [tagId]);
};

const getTagPosts = async (tagId) => {
    return await query(`
        SELECT 
            p.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            f.name AS fandom_name
        FROM posts p
        JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN fandoms f ON p.fandom_id = f.id
        WHERE pt.tag_id = ?
        ORDER BY p.created_at DESC
    `, [tagId]);
};

const createTag = async (data) => {
    const { name } = data;

    const result = await query(`
        INSERT INTO tags (name)
        VALUES (?)
    `, [name]);

    return {
        id: result.insertId,
        name
    };
};

const updateTag = async (id, data) => {
    const { name } = data;

    await query(`
        UPDATE tags
        SET name = ?
        WHERE id = ?
    `, [name, id]);

    return {
        id,
        name
    };
};

const deleteTag = async (id) => {
    await query(`
        DELETE FROM tags
        WHERE id = ?
    `, [id]);

    return { id };
};

const addTagToWork = async (workId, tagId) => {
    await query(`
        INSERT IGNORE INTO work_tags (work_id, tag_id)
        VALUES (?, ?)
    `, [workId, tagId]);

    return {
        work_id: workId,
        tag_id: tagId
    };
};

const removeTagFromWork = async (workId, tagId) => {
    await query(`
        DELETE FROM work_tags
        WHERE work_id = ? AND tag_id = ?
    `, [workId, tagId]);

    return {
        work_id: workId,
        tag_id: tagId
    };
};

const addTagToPost = async (postId, tagId) => {
    await query(`
        INSERT IGNORE INTO post_tags (post_id, tag_id)
        VALUES (?, ?)
    `, [postId, tagId]);

    return {
        post_id: postId,
        tag_id: tagId
    };
};

const removeTagFromPost = async (postId, tagId) => {
    await query(`
        DELETE FROM post_tags
        WHERE post_id = ? AND tag_id = ?
    `, [postId, tagId]);

    return {
        post_id: postId,
        tag_id: tagId
    };
};

module.exports = {
    getAllTags,
    getPopularTags,
    getTagById,
    searchTags,
    getTagWorks,
    getTagPosts,
    createTag,
    updateTag,
    deleteTag,
    addTagToWork,
    removeTagFromWork,
    addTagToPost,
    removeTagFromPost
};
const { query } = require('../config/database');
const { matureOnlySql } = require('../utils/contentRating');

const getAllFandoms = async () => {
    return await query(`
        SELECT *
        FROM fandoms
        ORDER BY name ASC
    `);
};

const getFandomById = async (id) => {
    const rows = await query(`
        SELECT *
        FROM fandoms
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const searchFandomsByName = async (name) => {
    return await query(`
        SELECT *
        FROM fandoms
        WHERE name LIKE ?
        ORDER BY name ASC
    `, [`%${name}%`]);
};

const getWorksByFandomId = async (fandomId, showMature = false) => {
    return await query(`
        SELECT 
            w.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar
        FROM works w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.fandom_id = ? AND w.status = 'active'${matureOnlySql('w', showMature)}
        ORDER BY w.created_at DESC
    `, [fandomId]);
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

const getFandomStats = async (fandomId) => {
    const worksCount = await query(`
        SELECT COUNT(*) AS count
        FROM works
        WHERE fandom_id = ? AND status = 'active'
    `, [fandomId]);

    const postsCount = await query(`
        SELECT COUNT(*) AS count
        FROM posts
        WHERE fandom_id = ? AND status = 'active'
    `, [fandomId]);

    const authorsCount = await query(`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM (
            SELECT user_id FROM works WHERE fandom_id = ? AND status = 'active'
            UNION
            SELECT user_id FROM posts WHERE fandom_id = ? AND status = 'active'
        ) AS authors
    `, [fandomId, fandomId]);

    const popularTags = await query(`
        SELECT 
            t.id,
            t.name,
            COUNT(*) AS usage_count
        FROM tags t
        JOIN work_tags wt ON t.id = wt.tag_id
        JOIN works w ON wt.work_id = w.id
        WHERE w.fandom_id = ? AND w.status = 'active'
        GROUP BY t.id, t.name
        ORDER BY usage_count DESC
        LIMIT 10
    `, [fandomId]);

    return {
        works_count: worksCount[0].count,
        posts_count: postsCount[0].count,
        authors_count: authorsCount[0].count,
        popular_tags: popularTags
    };
};

const getAuthorsByFandomId = async (fandomId) => {
    return query(`
        SELECT
            u.id,
            u.name,
            u.avatar_url,
            (SELECT COUNT(*) FROM works w WHERE w.user_id = u.id AND w.fandom_id = ? AND w.status = 'active') AS works_count,
            (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.fandom_id = ? AND p.status = 'active') AS posts_count,
            (
                SELECT COUNT(*)
                FROM likes l
                WHERE (l.target_type = 'work' AND l.target_id IN (
                    SELECT id FROM works w2 WHERE w2.user_id = u.id AND w2.fandom_id = ? AND w2.status = 'active'
                ))
                OR (l.target_type = 'post' AND l.target_id IN (
                    SELECT id FROM posts p2 WHERE p2.user_id = u.id AND p2.fandom_id = ? AND p2.status = 'active'
                ))
            ) AS likes_received_count
        FROM users u
        WHERE u.id IN (
            SELECT user_id FROM works WHERE fandom_id = ? AND status = 'active'
            UNION
            SELECT user_id FROM posts WHERE fandom_id = ? AND status = 'active'
        )
        ORDER BY works_count DESC, posts_count DESC, likes_received_count DESC, u.name ASC
    `, [fandomId, fandomId, fandomId, fandomId, fandomId, fandomId]);
};

const createFandom = async (data) => {
    const { name, description, cover_image } = data;

    const result = await query(`
        INSERT INTO fandoms (name, description, cover_image)
        VALUES (?, ?, ?)
    `, [
        name,
        description || null,
        cover_image || null
    ]);

    return {
        id: result.insertId,
        name,
        description,
        cover_image
    };
};

const updateFandom = async (id, data) => {
    const { name, description, cover_image } = data;

    await query(`
        UPDATE fandoms
        SET name = ?, description = ?, cover_image = ?
        WHERE id = ?
    `, [
        name,
        description || null,
        cover_image || null,
        id
    ]);

    return {
        id,
        name,
        description,
        cover_image
    };
};

const deleteFandom = async (id) => {
    await query(`
        DELETE FROM fandoms
        WHERE id = ?
    `, [id]);

    return { id };
};

module.exports = {
    getAllFandoms,
    getFandomById,
    searchFandomsByName,
    getWorksByFandomId,
    getPostsByFandomId,
    getAuthorsByFandomId,
    getFandomStats,
    createFandom,
    updateFandom,
    deleteFandom
};
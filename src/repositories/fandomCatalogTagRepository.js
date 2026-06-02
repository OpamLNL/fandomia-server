const { query } = require('../config/database');

const getAllCatalogTags = async () => {
    return await query(`
        SELECT
            t.id,
            t.name,
            t.sort_order,
            COUNT(DISTINCT l.fandom_id) AS fandoms_count
        FROM fandom_catalog_tags t
        LEFT JOIN fandom_catalog_tag_links l ON t.id = l.catalog_tag_id
        GROUP BY t.id, t.name, t.sort_order
        ORDER BY t.sort_order ASC, t.name ASC
    `);
};

const getCatalogTagsByFandomId = async (fandomId) => {
    return await query(`
        SELECT t.id, t.name, t.sort_order
        FROM fandom_catalog_tags t
        JOIN fandom_catalog_tag_links l ON t.id = l.catalog_tag_id
        WHERE l.fandom_id = ?
        ORDER BY t.sort_order ASC, t.name ASC
    `, [fandomId]);
};

const getCatalogTagsByFandomIds = async (fandomIds) => {
    if (!fandomIds.length) return [];

    const placeholders = fandomIds.map(() => '?').join(',');
    return await query(`
        SELECT l.fandom_id, t.id, t.name, t.sort_order
        FROM fandom_catalog_tags t
        JOIN fandom_catalog_tag_links l ON t.id = l.catalog_tag_id
        WHERE l.fandom_id IN (${placeholders})
        ORDER BY t.sort_order ASC, t.name ASC
    `, fandomIds);
};

const getFandomsByCatalogTagId = async (catalogTagId) => {
    return await query(`
        SELECT f.*
        FROM fandoms f
        JOIN fandom_catalog_tag_links l ON f.id = l.fandom_id
        WHERE l.catalog_tag_id = ?
        ORDER BY f.name ASC
    `, [catalogTagId]);
};

const setFandomCatalogTags = async (fandomId, tagIds = []) => {
    await query(`DELETE FROM fandom_catalog_tag_links WHERE fandom_id = ?`, [fandomId]);

    const uniqueIds = [...new Set(tagIds.map(Number).filter((id) => id > 0))];
    if (!uniqueIds.length) return;

    const placeholders = uniqueIds.map(() => '?').join(',');
    const valid = await query(
        `SELECT id FROM fandom_catalog_tags WHERE id IN (${placeholders})`,
        uniqueIds
    );

    for (const row of valid) {
        await query(
            `INSERT INTO fandom_catalog_tag_links (fandom_id, catalog_tag_id) VALUES (?, ?)`,
            [fandomId, row.id]
        );
    }
};

const catalogTagExists = async (id) => {
    const rows = await query(`SELECT id FROM fandom_catalog_tags WHERE id = ?`, [id]);
    return rows.length > 0;
};

module.exports = {
    getAllCatalogTags,
    getCatalogTagsByFandomId,
    getCatalogTagsByFandomIds,
    getFandomsByCatalogTagId,
    setFandomCatalogTags,
    catalogTagExists,
};

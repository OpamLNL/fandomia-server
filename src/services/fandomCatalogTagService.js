const fandomCatalogTagRepository = require('../repositories/fandomCatalogTagRepository');

const attachCatalogTags = async (fandoms) => {
    const list = Array.isArray(fandoms) ? fandoms : [fandoms];
    if (!list.length) return fandoms;

    const ids = list.map((f) => f.id).filter(Boolean);
    const tagRows = await fandomCatalogTagRepository.getCatalogTagsByFandomIds(ids);
    const tagsByFandom = {};

    for (const row of tagRows) {
        if (!tagsByFandom[row.fandom_id]) tagsByFandom[row.fandom_id] = [];
        tagsByFandom[row.fandom_id].push({
            id: row.id,
            name: row.name,
            sort_order: row.sort_order,
        });
    }

    const enriched = list.map((fandom) => ({
        ...fandom,
        catalog_tags: tagsByFandom[fandom.id] || [],
    }));

    return Array.isArray(fandoms) ? enriched : enriched[0];
};

const getAllCatalogTags = async () => {
    return await fandomCatalogTagRepository.getAllCatalogTags();
};

const getCatalogTagsByFandomId = async (fandomId) => {
    return await fandomCatalogTagRepository.getCatalogTagsByFandomId(fandomId);
};

const normalizeTagIds = async (tagIds) => {
    if (!Array.isArray(tagIds)) return [];

    const unique = [...new Set(tagIds.map(Number).filter((id) => id > 0))];
    const result = [];

    for (const id of unique) {
        if (await fandomCatalogTagRepository.catalogTagExists(id)) {
            result.push(id);
        }
    }

    return result;
};

module.exports = {
    attachCatalogTags,
    getAllCatalogTags,
    getCatalogTagsByFandomId,
    normalizeTagIds,
};

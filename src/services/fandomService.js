const fandomRepository = require('../repositories/fandomRepository');
const fandomCatalogTagRepository = require('../repositories/fandomCatalogTagRepository');
const workService = require('./workService');
const postService = require('./postService');
const fileUploadService = require('./fileUploadService');
const fandomCatalogTagService = require('./fandomCatalogTagService');

const parseCatalogTagId = (value) => {
    if (value === null || value === undefined || value === '' || value === 'all') {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getAllFandoms = async (query = {}) => {
    const catalogTagId = parseCatalogTagId(query.catalog_tag_id);
    const fandoms = await fandomRepository.getAllFandoms(catalogTagId);
    return await fandomCatalogTagService.attachCatalogTags(fandoms);
};

const getFandomById = async (id) => {
    const fandom = await fandomRepository.getFandomById(id);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return await fandomCatalogTagService.attachCatalogTags(fandom);
};

const searchFandomsByName = async (name, query = {}) => {
    const catalogTagId = parseCatalogTagId(query.catalog_tag_id);
    let fandoms;

    if (!name || !name.trim()) {
        fandoms = await fandomRepository.getAllFandoms(catalogTagId);
    } else {
        fandoms = await fandomRepository.searchFandomsByName(name.trim());
        if (catalogTagId) {
            const allowed = new Set(
                (await fandomCatalogTagRepository.getFandomsByCatalogTagId(catalogTagId)).map((f) => f.id)
            );
            fandoms = fandoms.filter((f) => allowed.has(f.id));
        }
    }

    return await fandomCatalogTagService.attachCatalogTags(fandoms);
};

const getWorksByFandomId = async (fandomId, viewer = {}) => {
    const fandom = await fandomRepository.getFandomById(fandomId);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return workService.getWorksByFandomId(fandomId, viewer);
};

const getPostsByFandomId = async (fandomId, viewer = {}) => {
    const fandom = await fandomRepository.getFandomById(fandomId);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return postService.getPostsByFandomId(fandomId, viewer);
};

const getAuthorsByFandomId = async (fandomId) => {
    const fandom = await fandomRepository.getFandomById(fandomId);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return await fandomRepository.getAuthorsByFandomId(fandomId);
};

const getFandomStats = async (fandomId) => {
    const fandom = await fandomRepository.getFandomById(fandomId);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return await fandomRepository.getFandomStats(fandomId);
};

const createFandom = async (data) => {
    if (!data.name || !data.name.trim()) {
        throw new Error('Назва фандому обовʼязкова');
    }

    const created = await fandomRepository.createFandom({
        name: data.name.trim(),
        description: data.description || null,
        cover_image: data.cover_image || null
    });

    if (Array.isArray(data.catalog_tag_ids)) {
        const tagIds = await fandomCatalogTagService.normalizeTagIds(data.catalog_tag_ids);
        await fandomCatalogTagRepository.setFandomCatalogTags(created.id, tagIds);
    }

    return await getFandomById(created.id);
};

const updateFandom = async (id, data) => {
    const existing = await fandomRepository.getFandomById(id);

    if (!existing) {
        throw new Error('Фандом не знайдено');
    }

    if (!data.name || !data.name.trim()) {
        throw new Error('Назва фандому обовʼязкова');
    }

    await fandomRepository.updateFandom(id, {
        name: data.name.trim(),
        description: data.description || null,
        cover_image: data.cover_image || null
    });

    if (Array.isArray(data.catalog_tag_ids)) {
        const tagIds = await fandomCatalogTagService.normalizeTagIds(data.catalog_tag_ids);
        await fandomCatalogTagRepository.setFandomCatalogTags(id, tagIds);
    }

    return await getFandomById(id);
};

const deleteFandom = async (id) => {
    const existing = await fandomRepository.getFandomById(id);

    if (!existing) {
        throw new Error('Фандом не знайдено');
    }

    return await fandomRepository.deleteFandom(id);
};

const uploadFandomCover = async (id, file) => {
    const existing = await fandomRepository.getFandomById(id);

    if (!existing) {
        throw new Error('Фандом не знайдено');
    }

    if (!file) {
        throw new Error('Файл обкладинки не передано');
    }

    const uploaded = await fileUploadService.saveFandomCover(id, file);

    await fandomRepository.updateFandom(id, {
        name: existing.name,
        description: existing.description,
        cover_image: uploaded.url,
    });

    return await getFandomById(id);
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
    deleteFandom,
    uploadFandomCover,
};
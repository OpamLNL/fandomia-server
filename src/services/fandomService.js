const fandomRepository = require('../repositories/fandomRepository');

const getAllFandoms = async () => {
    return await fandomRepository.getAllFandoms();
};

const getFandomById = async (id) => {
    const fandom = await fandomRepository.getFandomById(id);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return fandom;
};

const searchFandomsByName = async (name) => {
    if (!name || !name.trim()) {
        return await fandomRepository.getAllFandoms();
    }

    return await fandomRepository.searchFandomsByName(name.trim());
};

const getWorksByFandomId = async (fandomId) => {
    const fandom = await fandomRepository.getFandomById(fandomId);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return await fandomRepository.getWorksByFandomId(fandomId);
};

const getPostsByFandomId = async (fandomId) => {
    const fandom = await fandomRepository.getFandomById(fandomId);

    if (!fandom) {
        throw new Error('Фандом не знайдено');
    }

    return await fandomRepository.getPostsByFandomId(fandomId);
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

    return await fandomRepository.createFandom({
        name: data.name.trim(),
        description: data.description || null,
        cover_image: data.cover_image || null
    });
};

const updateFandom = async (id, data) => {
    const existing = await fandomRepository.getFandomById(id);

    if (!existing) {
        throw new Error('Фандом не знайдено');
    }

    if (!data.name || !data.name.trim()) {
        throw new Error('Назва фандому обовʼязкова');
    }

    return await fandomRepository.updateFandom(id, {
        name: data.name.trim(),
        description: data.description || null,
        cover_image: data.cover_image || null
    });
};

const deleteFandom = async (id) => {
    const existing = await fandomRepository.getFandomById(id);

    if (!existing) {
        throw new Error('Фандом не знайдено');
    }

    return await fandomRepository.deleteFandom(id);
};

module.exports = {
    getAllFandoms,
    getFandomById,
    searchFandomsByName,
    getWorksByFandomId,
    getPostsByFandomId,
    getFandomStats,
    createFandom,
    updateFandom,
    deleteFandom
};
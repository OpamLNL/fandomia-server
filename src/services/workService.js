const workRepository = require('../repositories/workRepository');
const { WORK_TYPES, createWorkEntity } = require('../models/workModel');

const enrichWork = async (work) => {
    if (!work) return null;

    const images = await workRepository.getWorkImages(work.id);
    const tags = await workRepository.getWorkTags(work.id);

    return createWorkEntity({
        ...work,
        images,
        tags
    });
};

const enrichWorks = async (works) => {
    const result = [];

    for (const work of works) {
        result.push(await enrichWork(work));
    }

    return result;
};

const getAllWorks = async () => {
    const works = await workRepository.getAllWorks();
    return await enrichWorks(works);
};

const getWorkById = async (id) => {
    const work = await workRepository.getWorkById(id);

    if (!work) {
        throw new Error('Роботу не знайдено');
    }

    return await enrichWork(work);
};

const getWorksByUserId = async (userId) => {
    const works = await workRepository.getWorksByUserId(userId);
    return await enrichWorks(works);
};

const getWorksByFandomId = async (fandomId) => {
    const works = await workRepository.getWorksByFandomId(fandomId);
    return await enrichWorks(works);
};

const getWorksByType = async (type) => {
    if (!Object.values(WORK_TYPES).includes(type)) {
        throw new Error('Некоректний тип роботи');
    }

    const works = await workRepository.getWorksByType(type);
    return await enrichWorks(works);
};

const searchWorks = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) {
        return await getAllWorks();
    }

    const works = await workRepository.searchWorks(searchQuery.trim());
    return await enrichWorks(works);
};

const getWorksByTagId = async (tagId) => {
    const works = await workRepository.getWorksByTagId(tagId);
    return await enrichWorks(works);
};

const createWork = async (data, user) => {
    if (user?.is_blocked) {
        throw new Error('Користувач заблокований');
    }

    if (!data.user_id) {
        throw new Error('Автор роботи обовʼязковий');
    }

    if (!data.fandom_id) {
        throw new Error('Фандом обовʼязковий');
    }

    if (!data.title || !data.title.trim()) {
        throw new Error('Назва роботи обовʼязкова');
    }

    if (data.type && !Object.values(WORK_TYPES).includes(data.type)) {
        throw new Error('Некоректний тип роботи');
    }

    const work = await workRepository.createWork({
        user_id: data.user_id,
        fandom_id: data.fandom_id,
        title: data.title.trim(),
        description: data.description || null,
        type: data.type || WORK_TYPES.FANFIC
    });

    if (Array.isArray(data.images)) {
        for (let i = 0; i < data.images.length; i++) {
            await workRepository.addWorkImage(work.id, data.images[i], i);
        }
    }

    return await getWorkById(work.id);
};

const updateWork = async (id, data) => {
    const existing = await workRepository.getWorkById(id);

    if (!existing) {
        throw new Error('Роботу не знайдено');
    }

    if (!data.title || !data.title.trim()) {
        throw new Error('Назва роботи обовʼязкова');
    }

    if (data.type && !Object.values(WORK_TYPES).includes(data.type)) {
        throw new Error('Некоректний тип роботи');
    }

    await workRepository.updateWork(id, {
        fandom_id: data.fandom_id,
        title: data.title.trim(),
        description: data.description || null,
        type: data.type || existing.type
    });

    return await getWorkById(id);
};

const deleteWork = async (id) => {
    const existing = await workRepository.getWorkById(id);

    if (!existing) {
        throw new Error('Роботу не знайдено');
    }

    return await workRepository.deleteWork(id);
};

module.exports = {
    getAllWorks,
    getWorkById,
    getWorksByUserId,
    getWorksByFandomId,
    getWorksByType,
    searchWorks,
    getWorksByTagId,
    createWork,
    updateWork,
    deleteWork
};
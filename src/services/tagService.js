const tagRepository = require('../repositories/tagRepository');
const { createTagEntity } = require('../models/tagModel');

const getAllTags = async () => {
    const tags = await tagRepository.getAllTags();
    return tags.map(tag => createTagEntity(tag));
};

const getPopularTags = async () => {
    const tags = await tagRepository.getPopularTags();
    return tags.map(tag => createTagEntity(tag));
};

const getTagById = async (id) => {
    const tag = await tagRepository.getTagById(id);

    if (!tag) {
        throw new Error('Тег не знайдено');
    }

    return createTagEntity(tag);
};

const searchTags = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) {
        return await getAllTags();
    }

    const tags = await tagRepository.searchTags(searchQuery.trim());
    return tags.map(tag => createTagEntity(tag));
};

const getTagWorks = async (tagId) => {
    const tag = await tagRepository.getTagById(tagId);

    if (!tag) {
        throw new Error('Тег не знайдено');
    }

    return await tagRepository.getTagWorks(tagId);
};

const getTagPosts = async (tagId) => {
    const tag = await tagRepository.getTagById(tagId);

    if (!tag) {
        throw new Error('Тег не знайдено');
    }

    return await tagRepository.getTagPosts(tagId);
};

const createTag = async (data) => {
    if (!data.name || !data.name.trim()) {
        throw new Error('Назва тегу обовʼязкова');
    }

    return await tagRepository.createTag({
        name: data.name.trim()
    });
};

const updateTag = async (id, data) => {
    const existing = await tagRepository.getTagById(id);

    if (!existing) {
        throw new Error('Тег не знайдено');
    }

    if (!data.name || !data.name.trim()) {
        throw new Error('Назва тегу обовʼязкова');
    }

    return await tagRepository.updateTag(id, {
        name: data.name.trim()
    });
};

const deleteTag = async (id) => {
    const existing = await tagRepository.getTagById(id);

    if (!existing) {
        throw new Error('Тег не знайдено');
    }

    return await tagRepository.deleteTag(id);
};

const addTagToWork = async (workId, tagId) => {
    const tag = await tagRepository.getTagById(tagId);

    if (!tag) {
        throw new Error('Тег не знайдено');
    }

    return await tagRepository.addTagToWork(workId, tagId);
};

const removeTagFromWork = async (workId, tagId) => {
    return await tagRepository.removeTagFromWork(workId, tagId);
};

const addTagToPost = async (postId, tagId) => {
    const tag = await tagRepository.getTagById(tagId);

    if (!tag) {
        throw new Error('Тег не знайдено');
    }

    return await tagRepository.addTagToPost(postId, tagId);
};

const removeTagFromPost = async (postId, tagId) => {
    return await tagRepository.removeTagFromPost(postId, tagId);
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
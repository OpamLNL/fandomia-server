const postRepository = require('../repositories/postRepository');
const { POST_TYPES, createPostEntity } = require('../models/postModel');
const { normalizeContentRating, assertCanViewContent } = require('../utils/contentRating');

const enrichPost = async (post) => {
    if (!post) return null;

    const tags = await postRepository.getPostTags(post.id);

    return createPostEntity({
        ...post,
        tags,
    });
};

const enrichPosts = async (posts) => {
    const result = [];

    for (const post of posts) {
        result.push(await enrichPost(post));
    }

    return result;
};

const getAllPosts = async (viewer = {}) => {
    const posts = await postRepository.getAllPosts(Boolean(viewer.showMature));
    return await enrichPosts(posts);
};

const getPostById = async (id, viewer = {}) => {
    const post = await postRepository.getPostById(id);

    if (!post) {
        throw new Error('Пост не знайдено');
    }

    assertCanViewContent(post, viewer);

    return await enrichPost(post);
};

const getPostsByUserId = async (userId) => {
    const posts = await postRepository.getPostsByUserId(userId);
    return await enrichPosts(posts);
};

const getPostsByFandomId = async (fandomId, viewer = {}) => {
    const posts = await postRepository.getPostsByFandomId(fandomId, Boolean(viewer.showMature));
    return await enrichPosts(posts);
};

const getPostsByType = async (type, viewer = {}) => {
    if (!Object.values(POST_TYPES).includes(type)) {
        throw new Error('Некоректний тип поста');
    }

    const posts = await postRepository.getPostsByType(type, Boolean(viewer.showMature));
    return await enrichPosts(posts);
};

const getPostsByTagId = async (tagId, viewer = {}) => {
    const posts = await postRepository.getPostsByTagId(tagId, Boolean(viewer.showMature));
    return await enrichPosts(posts);
};

const searchPosts = async (searchQuery, viewer = {}) => {
    if (!searchQuery || !searchQuery.trim()) {
        return await getAllPosts(viewer);
    }

    const posts = await postRepository.searchPosts(searchQuery.trim(), Boolean(viewer.showMature));
    return await enrichPosts(posts);
};

const getLatestPosts = async (limit, viewer = {}) => {
    const posts = await postRepository.getLatestPosts(limit || 10, Boolean(viewer.showMature));
    return await enrichPosts(posts);
};

const createPost = async (data) => {
    if (!data.user_id) {
        throw new Error('Автор поста обовʼязковий');
    }

    if (!data.fandom_id) {
        throw new Error('Фандом обовʼязковий');
    }

    if (!data.title || !data.title.trim()) {
        throw new Error('Назва поста обовʼязкова');
    }

    if (data.type && !Object.values(POST_TYPES).includes(data.type)) {
        throw new Error('Некоректний тип поста');
    }

    const post = await postRepository.createPost({
        user_id: data.user_id,
        fandom_id: data.fandom_id,
        title: data.title.trim(),
        content: data.content || null,
        type: data.type || POST_TYPES.DISCUSSION,
        content_rating: normalizeContentRating(data.content_rating),
    });

    if (Array.isArray(data.tags)) {
        for (const tagId of data.tags) {
            await postRepository.addPostTag(post.id, tagId);
        }
    }

    return await getPostById(post.id, { showMature: true, viewerId: data.user_id });
};

const updatePost = async (id, data) => {
    const existing = await postRepository.getPostById(id);

    if (!existing) {
        throw new Error('Пост не знайдено');
    }

    if (!data.title || !data.title.trim()) {
        throw new Error('Назва поста обовʼязкова');
    }

    if (data.type && !Object.values(POST_TYPES).includes(data.type)) {
        throw new Error('Некоректний тип поста');
    }

    await postRepository.updatePost(id, {
        fandom_id: data.fandom_id,
        title: data.title.trim(),
        content: data.content || null,
        type: data.type || existing.type,
        content_rating: normalizeContentRating(
            data.content_rating !== undefined ? data.content_rating : existing.content_rating
        ),
    });

    if (Array.isArray(data.tags)) {
        await postRepository.deletePostTags(id);

        for (const tagId of data.tags) {
            await postRepository.addPostTag(id, tagId);
        }
    }

    return await getPostById(id, { showMature: true, viewerId: existing.user_id });
};

const deletePost = async (id) => {
    const existing = await postRepository.getPostById(id);

    if (!existing) {
        throw new Error('Пост не знайдено');
    }

    return await postRepository.deletePost(id);
};

module.exports = {
    getAllPosts,
    getPostById,
    getPostsByUserId,
    getPostsByFandomId,
    getPostsByType,
    getPostsByTagId,
    searchPosts,
    getLatestPosts,
    createPost,
    updatePost,
    deletePost,
};

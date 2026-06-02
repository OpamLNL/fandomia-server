const postRepository = require('../repositories/postRepository');
const workRepository = require('../repositories/workRepository');
const { POST_TYPES, createPostEntity } = require('../models/postModel');
const { getPagination, buildPaginationResponse } = require('../utils/pagination');
const { normalizeContentRating, assertCanViewContent } = require('../utils/contentRating');

const resolveLinkedWork = async (workId, viewer = {}) => {
    if (!workId) return null;

    const work = await workRepository.getWorkById(workId);
    if (!work || work.status !== 'active') return null;

    try {
        assertCanViewContent(work, viewer);
    } catch {
        return null;
    }

    const images = await workRepository.getWorkImages(workId);

    return {
        id: work.id,
        title: work.title,
        description: work.description,
        type: work.type,
        author_name: work.author_name,
        fandom_name: work.fandom_name,
        content_rating: work.content_rating,
        image_path: images[0]?.image_path || null,
    };
};

const normalizeWorkId = async (fandomId, workId) => {
    if (workId === null || workId === undefined || workId === '' || workId === 0) {
        return null;
    }

    const parsedId = Number(workId);
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
        throw new Error('Некоректний ідентифікатор твору');
    }

    const work = await workRepository.getWorkById(parsedId);
    if (!work || work.status !== 'active') {
        throw new Error('Повʼязаний твір не знайдено');
    }

    if (Number(work.fandom_id) !== Number(fandomId)) {
        throw new Error('Твір має належати тому самому фандому, що й пост');
    }

    return parsedId;
};

const enrichPost = async (post, viewer = {}) => {
    if (!post) return null;

    const tags = await postRepository.getPostTags(post.id);
    const linked_work = await resolveLinkedWork(post.work_id, viewer);

    return createPostEntity({
        ...post,
        tags,
        linked_work,
    });
};

const enrichPosts = async (posts, viewer = {}) => {
    const result = [];

    for (const post of posts) {
        result.push(await enrichPost(post, viewer));
    }

    return result;
};

const getAllPosts = async (query = {}, viewer = {}) => {
    const { page, limit, offset } = getPagination(query);
    const showMature = Boolean(viewer.showMature);
    const sort = query.sort === 'asc' ? 'asc' : 'desc';

    const posts = await postRepository.getAllPosts(limit, offset, showMature, sort);
    const total = await postRepository.countPosts(showMature);
    const enriched = await enrichPosts(posts, viewer);

    return buildPaginationResponse({
        data: enriched,
        total,
        page,
        limit,
    });
};

const getPostById = async (id, viewer = {}) => {
    const post = await postRepository.getPostById(id);

    if (!post) {
        throw new Error('Пост не знайдено');
    }

    assertCanViewContent(post, viewer);

    return await enrichPost(post, viewer);
};

const getPostsByUserId = async (userId, viewer = {}) => {
    const posts = await postRepository.getPostsByUserId(userId);
    return await enrichPosts(posts, viewer);
};

const getPostsByFandomId = async (fandomId, viewer = {}) => {
    const posts = await postRepository.getPostsByFandomId(fandomId, Boolean(viewer.showMature));
    return await enrichPosts(posts, viewer);
};

const getPostsByType = async (type, viewer = {}) => {
    if (!Object.values(POST_TYPES).includes(type)) {
        throw new Error('Некоректний тип поста');
    }

    const posts = await postRepository.getPostsByType(type, Boolean(viewer.showMature));
    return await enrichPosts(posts, viewer);
};

const getPostsByTagId = async (tagId, viewer = {}) => {
    const posts = await postRepository.getPostsByTagId(tagId, Boolean(viewer.showMature));
    return await enrichPosts(posts, viewer);
};

const searchPosts = async (searchQuery, query = {}, viewer = {}) => {
    if (!searchQuery || !searchQuery.trim()) {
        return await getAllPosts(query, viewer);
    }

    const { page, limit, offset } = getPagination(query);
    const showMature = Boolean(viewer.showMature);
    const sort = query.sort === 'asc' ? 'asc' : 'desc';
    const trimmed = searchQuery.trim();

    const posts = await postRepository.searchPosts(trimmed, limit, offset, showMature, sort);
    const total = await postRepository.countSearchPosts(trimmed, showMature);
    const enriched = await enrichPosts(posts, viewer);

    return buildPaginationResponse({
        data: enriched,
        total,
        page,
        limit,
    });
};

const getLatestPosts = async (limit, viewer = {}) => {
    const posts = await postRepository.getLatestPosts(limit || 10, Boolean(viewer.showMature));
    return await enrichPosts(posts, viewer);
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

    const work_id = await normalizeWorkId(data.fandom_id, data.work_id);

    const post = await postRepository.createPost({
        user_id: data.user_id,
        fandom_id: data.fandom_id,
        work_id,
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

    const work_id = data.work_id !== undefined
        ? await normalizeWorkId(data.fandom_id, data.work_id)
        : existing.work_id;

    await postRepository.updatePost(id, {
        fandom_id: data.fandom_id,
        work_id,
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

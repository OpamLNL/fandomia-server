const postService = require('../services/postService');
const { getViewerContext } = require('../utils/contentRating');

function sendContentError(res, error) {
    if (error.code === 'MATURE_CONTENT') {
        return res.status(403).json({
            error: error.message,
            requires_mature_consent: true,
        });
    }
    throw error;
}

const getAllPosts = async (req, res) => {
    const posts = await postService.getAllPosts(getViewerContext(req));
    res.json(posts);
};

const getPostById = async (req, res) => {
    try {
        const post = await postService.getPostById(req.params.id, getViewerContext(req));
        res.json(post);
    } catch (error) {
        if (error.message === 'Пост не знайдено') {
            return res.status(404).json({ error: error.message });
        }
        sendContentError(res, error);
    }
};

const getPostsByUserId = async (req, res) => {
    const posts = await postService.getPostsByUserId(req.params.userId);
    res.json(posts);
};

const getPostsByFandomId = async (req, res) => {
    const posts = await postService.getPostsByFandomId(req.params.fandomId, getViewerContext(req));
    res.json(posts);
};

const getPostsByType = async (req, res) => {
    const posts = await postService.getPostsByType(req.params.type, getViewerContext(req));
    res.json(posts);
};

const getPostsByTagId = async (req, res) => {
    const posts = await postService.getPostsByTagId(req.params.tagId, getViewerContext(req));
    res.json(posts);
};

const searchPosts = async (req, res) => {
    const posts = await postService.searchPosts(req.query.query, getViewerContext(req));
    res.json(posts);
};

const getLatestPosts = async (req, res) => {
    const posts = await postService.getLatestPosts(req.query.limit, getViewerContext(req));
    res.json(posts);
};

const createPost = async (req, res) => {
    const post = await postService.createPost({
        ...req.body,
        user_id: req.user.id,
    });

    res.status(201).json(post);
};

const updatePost = async (req, res) => {
    const post = await postService.updatePost(req.params.id, req.body, req.user);
    res.json(post);
};

const deletePost = async (req, res) => {
    await postService.deletePost(req.params.id);
    res.json({ success: true });
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

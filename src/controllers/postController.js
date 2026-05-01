const postService = require('../services/postService');

const getAllPosts = async (req, res) => {
    const posts = await postService.getAllPosts();
    res.json(posts);
};

const getPostById = async (req, res) => {
    const post = await postService.getPostById(req.params.id);
    res.json(post);
};

const getPostsByUserId = async (req, res) => {
    const posts = await postService.getPostsByUserId(req.params.userId);
    res.json(posts);
};

const getPostsByFandomId = async (req, res) => {
    const posts = await postService.getPostsByFandomId(req.params.fandomId);
    res.json(posts);
};

const getPostsByType = async (req, res) => {
    const posts = await postService.getPostsByType(req.params.type);
    res.json(posts);
};

const getPostsByTagId = async (req, res) => {
    const posts = await postService.getPostsByTagId(req.params.tagId);
    res.json(posts);
};

const searchPosts = async (req, res) => {
    const posts = await postService.searchPosts(req.query.query);
    res.json(posts);
};

const getLatestPosts = async (req, res) => {
    const posts = await postService.getLatestPosts(req.query.limit);
    res.json(posts);
};

const createPost = async (req, res) => {
    const post = await postService.createPost(
        {
            ...req.body,
            user_id: req.user.id
        },
        req.user
    );

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
    deletePost
};
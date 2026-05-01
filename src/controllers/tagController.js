const tagService = require('../services/tagService');

const getAllTags = async (req, res) => {
    const tags = await tagService.getAllTags();
    res.json(tags);
};

const getPopularTags = async (req, res) => {
    const tags = await tagService.getPopularTags();
    res.json(tags);
};

const getTagById = async (req, res) => {
    const tag = await tagService.getTagById(req.params.id);
    res.json(tag);
};

const searchTags = async (req, res) => {
    const tags = await tagService.searchTags(req.query.query);
    res.json(tags);
};

const getTagWorks = async (req, res) => {
    const works = await tagService.getTagWorks(req.params.id);
    res.json(works);
};

const getTagPosts = async (req, res) => {
    const posts = await tagService.getTagPosts(req.params.id);
    res.json(posts);
};

const createTag = async (req, res) => {
    const tag = await tagService.createTag(req.body);
    res.status(201).json(tag);
};

const updateTag = async (req, res) => {
    const tag = await tagService.updateTag(req.params.id, req.body);
    res.json(tag);
};

const deleteTag = async (req, res) => {
    await tagService.deleteTag(req.params.id);
    res.json({ success: true });
};

const addTagToWork = async (req, res) => {
    const result = await tagService.addTagToWork(req.params.workId, req.params.tagId);
    res.status(201).json(result);
};

const removeTagFromWork = async (req, res) => {
    const result = await tagService.removeTagFromWork(req.params.workId, req.params.tagId);
    res.json(result);
};

const addTagToPost = async (req, res) => {
    const result = await tagService.addTagToPost(req.params.postId, req.params.tagId);
    res.status(201).json(result);
};

const removeTagFromPost = async (req, res) => {
    const result = await tagService.removeTagFromPost(req.params.postId, req.params.tagId);
    res.json(result);
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
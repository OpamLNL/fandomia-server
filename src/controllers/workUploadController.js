const workUploadService = require('../services/workUploadService');

const uploadWorkImages = async (req, res) => {
    const images = await workUploadService.uploadWorkImages(
        req.params.workId,
        req.files,
        req.user
    );

    res.status(201).json(images);
};

const getWorkImages = async (req, res) => {
    const images = await workUploadService.getWorkImages(req.params.workId);
    res.json(images);
};

const deleteWorkImage = async (req, res) => {
    await workUploadService.deleteWorkImage(req.params.imageId);
    res.json({ success: true });
};

const createWorkChapter = async (req, res) => {
    const chapter = await workUploadService.createWorkChapter(
        req.params.workId,
        req.body,
        req.user
    );

    res.status(201).json(chapter);
};

const getWorkChapters = async (req, res) => {
    const chapters = await workUploadService.getWorkChapters(req.params.workId);
    res.json(chapters);
};

const getChapterContent = async (req, res) => {
    const chapter = await workUploadService.getChapterContent(req.params.chapterId);
    res.json(chapter);
};

const updateChapterContent = async (req, res) => {
    const chapter = await workUploadService.updateChapterContent(
        req.params.chapterId,
        req.body,
        req.user
    );

    res.json(chapter);
};

const deleteChapter = async (req, res) => {
    await workUploadService.deleteChapter(req.params.chapterId);
    res.json({ success: true });
};

module.exports = {
    uploadWorkImages,
    getWorkImages,
    deleteWorkImage,
    createWorkChapter,
    getWorkChapters,
    getChapterContent,
    updateChapterContent,
    deleteChapter
};
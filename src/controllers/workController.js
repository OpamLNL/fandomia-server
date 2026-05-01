const workService = require('../services/workService');

const getAllWorks = async (req, res) => {
    const works = await workService.getAllWorks(req.query);
    res.json(works);
};

const getWorkById = async (req, res) => {
    const work = await workService.getWorkById(req.params.id);
    res.json(work);
};

const getWorksByUserId = async (req, res) => {
    const works = await workService.getWorksByUserId(req.params.userId);
    res.json(works);
};

const getWorksByFandomId = async (req, res) => {
    const works = await workService.getWorksByFandomId(req.params.fandomId);
    res.json(works);
};

const getWorksByType = async (req, res) => {
    const works = await workService.getWorksByType(req.params.type);
    res.json(works);
};

const getWorksByTagId = async (req, res) => {
    const works = await workService.getWorksByTagId(req.params.tagId);
    res.json(works);
};

const searchWorks = async (req, res) => {
    const works = await workService.searchWorks(req.query.query);
    res.json(works);
};

const createWork = async (req, res) => {
    const work = await workService.createWork(
        {
            ...req.body,
            user_id: req.user.id
        },
        req.user
    );

    res.status(201).json(work);
};

const updateWork = async (req, res) => {
    const work = await workService.updateWork(req.params.id, req.body, req.user);
    res.json(work);
};

const deleteWork = async (req, res) => {
    await workService.deleteWork(req.params.id);
    res.json({ success: true });
};

module.exports = {
    getAllWorks,
    getWorkById,
    getWorksByUserId,
    getWorksByFandomId,
    getWorksByType,
    getWorksByTagId,
    searchWorks,
    createWork,
    updateWork,
    deleteWork
};
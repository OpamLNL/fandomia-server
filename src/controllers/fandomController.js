const fandomService = require('../services/fandomService');

const getAllFandoms = async (req, res) => {
    try {
        const fandoms = await fandomService.getAllFandoms();
        res.json(fandoms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFandomById = async (req, res) => {
    try {
        const fandom = await fandomService.getFandomById(req.params.id);
        res.json(fandom);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const searchFandomsByName = async (req, res) => {
    try {
        const fandoms = await fandomService.searchFandomsByName(req.query.name);
        res.json(fandoms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWorksByFandomId = async (req, res) => {
    try {
        const works = await fandomService.getWorksByFandomId(req.params.id);
        res.json(works);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const getPostsByFandomId = async (req, res) => {
    try {
        const posts = await fandomService.getPostsByFandomId(req.params.id);
        res.json(posts);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const getFandomStats = async (req, res) => {
    try {
        const stats = await fandomService.getFandomStats(req.params.id);
        res.json(stats);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const createFandom = async (req, res) => {
    try {
        const fandom = await fandomService.createFandom(req.body);
        res.status(201).json(fandom);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateFandom = async (req, res) => {
    try {
        const fandom = await fandomService.updateFandom(req.params.id, req.body);
        res.json(fandom);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteFandom = async (req, res) => {
    try {
        await fandomService.deleteFandom(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
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
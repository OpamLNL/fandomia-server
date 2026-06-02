const fandomCatalogTagService = require('../services/fandomCatalogTagService');

const getAllCatalogTags = async (req, res) => {
    try {
        const tags = await fandomCatalogTagService.getAllCatalogTags();
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllCatalogTags,
};

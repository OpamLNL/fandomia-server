const express = require('express');
const router = express.Router();
const fandomCatalogTagController = require('../controllers/fandomCatalogTagController');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncHandler(fandomCatalogTagController.getAllCatalogTags));

module.exports = router;

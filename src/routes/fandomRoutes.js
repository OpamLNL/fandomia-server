const express = require('express');
const router = express.Router();

const fandomController = require('../controllers/fandomController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');
const { isModeratorOrAdmin } = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// public
router.get('/search', asyncHandler(fandomController.searchFandomsByName));

router.get('/', asyncHandler(fandomController.getAllFandoms));

router.get('/:id/works', asyncHandler(fandomController.getWorksByFandomId));
router.get('/:id/posts', asyncHandler(fandomController.getPostsByFandomId));
router.get('/:id/stats', asyncHandler(fandomController.getFandomStats));

router.get('/:id', asyncHandler(fandomController.getFandomById));

// protected: moderator/admin
router.post(
    '/',
    firebaseAuthMiddleware,
    isModeratorOrAdmin,
    asyncHandler(fandomController.createFandom)
);

router.put(
    '/:id',
    firebaseAuthMiddleware,
    isModeratorOrAdmin,
    asyncHandler(fandomController.updateFandom)
);

router.delete(
    '/:id',
    firebaseAuthMiddleware,
    isModeratorOrAdmin,
    asyncHandler(fandomController.deleteFandom)
);

module.exports = router;
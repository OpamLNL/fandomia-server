const express = require('express');
const router = express.Router();

const fandomController = require('../controllers/fandomController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');
const optionalFirebaseAuth = require('../middlewares/optionalFirebaseAuth');
const { isModeratorOrAdmin } = require('../middlewares/roleMiddleware');
const { uploadImages } = require('../middlewares/uploadMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// public
router.get('/search', asyncHandler(fandomController.searchFandomsByName));

router.get('/', asyncHandler(fandomController.getAllFandoms));

router.get('/:id/works', optionalFirebaseAuth, asyncHandler(fandomController.getWorksByFandomId));
router.get('/:id/posts', optionalFirebaseAuth, asyncHandler(fandomController.getPostsByFandomId));
router.get('/:id/authors', asyncHandler(fandomController.getAuthorsByFandomId));
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

router.post(
    '/:id/cover',
    firebaseAuthMiddleware,
    isModeratorOrAdmin,
    uploadImages.single('cover'),
    asyncHandler(fandomController.uploadFandomCover)
);

router.delete(
    '/:id',
    firebaseAuthMiddleware,
    isModeratorOrAdmin,
    asyncHandler(fandomController.deleteFandom)
);

module.exports = router;
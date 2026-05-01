const express = require('express');
const router = express.Router();

const workController = require('../controllers/workController');
const workRepository = require('../repositories/workRepository');

const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');
const {
    isAuthenticated,
    isOwnerOrModeratorOrAdmin
} = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const getWorkOwner = async (req) => {
    const work = await workRepository.getWorkById(req.params.id);

    if (!work) {
        throw new Error('Роботу не знайдено');
    }

    return work.user_id;
};

// public routes
router.get('/search', asyncHandler(workController.searchWorks));
router.get('/author/:userId', asyncHandler(workController.getWorksByUserId));
router.get('/fandom/:fandomId', asyncHandler(workController.getWorksByFandomId));
router.get('/type/:type', asyncHandler(workController.getWorksByType));
router.get('/tag/:tagId', asyncHandler(workController.getWorksByTagId));

router.get('/', asyncHandler(workController.getAllWorks));
router.get('/:id', asyncHandler(workController.getWorkById));

// protected routes
router.post(
    '/',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(workController.createWork)
);

router.put(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwner),
    asyncHandler(workController.updateWork)
);

router.delete(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwner),
    asyncHandler(workController.deleteWork)
);

module.exports = router;
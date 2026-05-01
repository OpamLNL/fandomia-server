const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');

const {
    isAdmin,
    isOwnerOrModeratorOrAdmin
} = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// public
router.get('/search', asyncHandler(userController.searchUsers));

router.get('/firebase/:firebaseUid', asyncHandler(userController.getUserByFirebaseUid));
router.get('/email/:email', asyncHandler(userController.getUserByEmail));

router.get('/:id/works', asyncHandler(userController.getUserWorks));
router.get('/:id/posts', asyncHandler(userController.getUserPosts));
router.get('/:id/comments', asyncHandler(userController.getUserComments));
router.get('/:id/stats', asyncHandler(userController.getUserStats));

router.get('/', asyncHandler(userController.getAllUsers));
router.get('/:id', asyncHandler(userController.getUserById));

// create/auth
router.post('/', asyncHandler(userController.createUser));
router.post('/auth', asyncHandler(userController.createUserAndAuthenticate));

// update profile: сам користувач / модератор / адмін
router.put(
    '/:id',
    firebaseAuthMiddleware,
    isOwnerOrModeratorOrAdmin((req) => req.params.id),
    asyncHandler(userController.updateUser)
);

// change role: тільки адмін
router.patch(
    '/:id/role',
    firebaseAuthMiddleware,
    isAdmin,
    asyncHandler(userController.updateUserRole)
);

// block/unblock: тільки адмін
router.patch(
    '/:id/block',
    firebaseAuthMiddleware,
    isAdmin,
    asyncHandler(userController.updateUserBlockedStatus)
);

// delete user: тільки адмін
router.delete(
    '/:id',
    firebaseAuthMiddleware,
    isAdmin,
    asyncHandler(userController.deleteUser)
);

module.exports = router;
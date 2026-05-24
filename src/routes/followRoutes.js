const express = require('express');
const router = express.Router();

const followController = require('../controllers/followController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');
const { isAuthenticated } = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
    '/toggle',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(followController.toggleFollow)
);

router.get(
    '/me',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(followController.getFollowing)
);

router.get(
    '/me/feed',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(followController.getFeed)
);

router.post(
    '/me/seen',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(followController.markFeedSeen)
);

router.get(
    '/check/:userId',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(followController.checkFollowing)
);

module.exports = router;

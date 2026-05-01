const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const postRepository = require('../repositories/postRepository');

const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');
const {
    isAuthenticated,
    isOwnerOrModeratorOrAdmin
} = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const getPostOwner = async (req) => {
    const post = await postRepository.getPostById(req.params.id);

    if (!post) {
        throw new Error('Пост не знайдено');
    }

    return post.user_id;
};

// public routes
router.get('/search', asyncHandler(postController.searchPosts));
router.get('/latest', asyncHandler(postController.getLatestPosts));

router.get('/author/:userId', asyncHandler(postController.getPostsByUserId));
router.get('/fandom/:fandomId', asyncHandler(postController.getPostsByFandomId));
router.get('/type/:type', asyncHandler(postController.getPostsByType));
router.get('/tag/:tagId', asyncHandler(postController.getPostsByTagId));

router.get('/', asyncHandler(postController.getAllPosts));
router.get('/:id', asyncHandler(postController.getPostById));

// protected routes
router.post(
    '/',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(postController.createPost)
);

router.put(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getPostOwner),
    asyncHandler(postController.updatePost)
);

router.delete(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getPostOwner),
    asyncHandler(postController.deletePost)
);

module.exports = router;
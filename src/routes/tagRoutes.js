const express = require('express');
const router = express.Router();

const tagController = require('../controllers/tagController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');

const {
    isAuthenticated,
    isAdmin,
    isOwnerOrModeratorOrAdmin
} = require('../middlewares/roleMiddleware');

const workRepository = require('../repositories/workRepository');
const postRepository = require('../repositories/postRepository');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const getWorkOwnerByWorkId = async (req) => {
    const work = await workRepository.getWorkById(req.params.workId);
    if (!work) throw new Error('Роботу не знайдено');
    return work.user_id;
};

const getPostOwnerByPostId = async (req) => {
    const post = await postRepository.getPostById(req.params.postId);
    if (!post) throw new Error('Пост не знайдено');
    return post.user_id;
};

/**
 * @swagger
 * tags:
 *   - name: Tags
 *     description: Робота з тегами
 */

/**
 * @swagger
 * /api/tags/search:
 *   get:
 *     summary: Пошук тегів
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/search', asyncHandler(tagController.searchTags));

/**
 * @swagger
 * /api/tags/popular:
 *   get:
 *     summary: Популярні теги
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/popular', asyncHandler(tagController.getPopularTags));

/**
 * @swagger
 * /api/tags/{id}/works:
 *   get:
 *     summary: Отримати роботи за тегом
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/works', asyncHandler(tagController.getTagWorks));

/**
 * @swagger
 * /api/tags/{id}/posts:
 *   get:
 *     summary: Отримати пости за тегом
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/posts', asyncHandler(tagController.getTagPosts));

/**
 * @swagger
 * /api/tags/works/{workId}/{tagId}:
 *   post:
 *     summary: Додати тег до роботи
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    '/works/:workId/:tagId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwnerByWorkId),
    asyncHandler(tagController.addTagToWork)
);

/**
 * @swagger
 * /api/tags/works/{workId}/{tagId}:
 *   delete:
 *     summary: Видалити тег з роботи
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.delete(
    '/works/:workId/:tagId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwnerByWorkId),
    asyncHandler(tagController.removeTagFromWork)
);

/**
 * @swagger
 * /api/tags/posts/{postId}/{tagId}:
 *   post:
 *     summary: Додати тег до поста
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    '/posts/:postId/:tagId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getPostOwnerByPostId),
    asyncHandler(tagController.addTagToPost)
);

/**
 * @swagger
 * /api/tags/posts/{postId}/{tagId}:
 *   delete:
 *     summary: Видалити тег з поста
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.delete(
    '/posts/:postId/:tagId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getPostOwnerByPostId),
    asyncHandler(tagController.removeTagFromPost)
);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Отримати всі теги
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', asyncHandler(tagController.getAllTags));

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Створити тег
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Romance
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    '/',
    firebaseAuthMiddleware,
    isAuthenticated,
    isAdmin,
    asyncHandler(tagController.createTag)
);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Отримати тег по ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тегу
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', asyncHandler(tagController.getTagById));

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Оновити тег
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тегу
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dark Fantasy
 *     responses:
 *       200:
 *         description: OK
 */
router.put(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isAdmin,
    asyncHandler(tagController.updateTag)
);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Видалити тег
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тегу
 *     responses:
 *       200:
 *         description: OK
 */
router.delete(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isAdmin,
    asyncHandler(tagController.deleteTag)
);

module.exports = router;
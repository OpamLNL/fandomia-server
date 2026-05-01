const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');
const { isAuthenticated, isAdmin } = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.use(firebaseAuthMiddleware);
router.use(isAuthenticated);
router.use(isAdmin);

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Адміністративне керування платформою
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Загальна статистика адмін-панелі
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/stats', asyncHandler(adminController.getStats));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Отримати всіх користувачів
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/users', asyncHandler(adminController.getUsers));

/**
 * @swagger
 * /api/admin/users/search:
 *   get:
 *     summary: Пошук користувачів
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
router.get('/users/search', asyncHandler(adminController.searchUsers));

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Змінити роль користувача
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin]
 *                 example: moderator
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/users/:id/role', asyncHandler(adminController.updateUserRole));

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   patch:
 *     summary: Заблокувати або розблокувати користувача
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_blocked
 *             properties:
 *               is_blocked:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/users/:id/block', asyncHandler(adminController.updateUserBlockedStatus));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Видалити користувача
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

/**
 * @swagger
 * /api/admin/works/{id}/status:
 *   patch:
 *     summary: Змінити статус роботи
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/works/:id/status', asyncHandler(adminController.updateWorkStatus));

/**
 * @swagger
 * /api/admin/posts/{id}/status:
 *   patch:
 *     summary: Змінити статус поста
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/posts/:id/status', asyncHandler(adminController.updatePostStatus));

/**
 * @swagger
 * /api/admin/comments/{id}/status:
 *   patch:
 *     summary: Змінити статус коментаря
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/comments/:id/status', asyncHandler(adminController.updateCommentStatus));

router.delete('/works/:id', asyncHandler(adminController.deleteWork));
router.delete('/posts/:id', asyncHandler(adminController.deletePost));
router.delete('/comments/:id', asyncHandler(adminController.deleteComment));

router.get('/reports', asyncHandler(adminController.getReports));
router.get('/reports/status/:status', asyncHandler(adminController.getReportsByStatus));
router.patch('/reports/:id/status', asyncHandler(adminController.updateReportStatus));
router.delete('/reports/:id', asyncHandler(adminController.deleteReport));

module.exports = router;
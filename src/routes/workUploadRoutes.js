const express = require('express');
const router = express.Router();

const workUploadController = require('../controllers/workUploadController');
const { uploadImages } = require('../middlewares/uploadMiddleware');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');

const {
    isAuthenticated,
    isOwnerOrModeratorOrAdmin
} = require('../middlewares/roleMiddleware');

const workRepository = require('../repositories/workRepository');
const workImageRepository = require('../repositories/workImageRepository');
const chapterRepository = require('../repositories/chapterRepository');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const getWorkOwnerByWorkId = async (req) => {
    const work = await workRepository.getWorkById(req.params.workId);
    if (!work) throw new Error('Роботу не знайдено');
    return work.user_id;
};

const getWorkOwnerByImageId = async (req) => {
    const image = await workImageRepository.getImageById(req.params.imageId);
    if (!image) throw new Error('Зображення не знайдено');

    const work = await workRepository.getWorkById(image.work_id);
    if (!work) throw new Error('Роботу не знайдено');

    return work.user_id;
};

const getWorkOwnerByChapterId = async (req) => {
    const chapter = await chapterRepository.getChapterById(req.params.chapterId);
    if (!chapter) throw new Error('Розділ не знайдено');

    const work = await workRepository.getWorkById(chapter.work_id);
    if (!work) throw new Error('Роботу не знайдено');

    return work.user_id;
};

/**
 * @swagger
 * tags:
 *   name: WorkUpload
 *   description: Завантаження файлів та розділів
 */

/**
 * @swagger
 * /api/work-upload/{workId}/images:
 *   post:
 *     summary: Завантажити картинки до роботи
 *     tags: [WorkUpload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 */
router.post(
    '/:workId/images',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwnerByWorkId),
    uploadImages.array('images', 10),
    asyncHandler(workUploadController.uploadWorkImages)
);

/**
 * @swagger
 * /api/work-upload/{workId}/images:
 *   get:
 *     summary: Отримати картинки роботи
 *     tags: [WorkUpload]
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 */
router.get(
    '/:workId/images',
    asyncHandler(workUploadController.getWorkImages)
);

/**
 * @swagger
 * /api/work-upload/images/{imageId}:
 *   delete:
 *     summary: Видалити картинку
 *     tags: [WorkUpload]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/images/:imageId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwnerByImageId),
    asyncHandler(workUploadController.deleteWorkImage)
);

/**
 * @swagger
 * /api/work-upload/{workId}/chapters:
 *   post:
 *     summary: Створити розділ
 *     tags: [WorkUpload]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/:workId/chapters',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwnerByWorkId),
    asyncHandler(workUploadController.createWorkChapter)
);

/**
 * @swagger
 * /api/work-upload/{workId}/chapters:
 *   get:
 *     summary: Отримати розділи роботи
 *     tags: [WorkUpload]
 */
router.get(
    '/:workId/chapters',
    asyncHandler(workUploadController.getWorkChapters)
);

/**
 * @swagger
 * /api/work-upload/chapters/{chapterId}:
 *   get:
 *     summary: Отримати контент розділу
 *     tags: [WorkUpload]
 */
router.get(
    '/chapters/:chapterId',
    asyncHandler(workUploadController.getChapterContent)
);

/**
 * @swagger
 * /api/work-upload/chapters/{chapterId}:
 *   put:
 *     summary: Оновити розділ
 *     tags: [WorkUpload]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/chapters/:chapterId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwnerByChapterId),
    asyncHandler(workUploadController.updateChapterContent)
);

/**
 * @swagger
 * /api/work-upload/chapters/{chapterId}:
 *   delete:
 *     summary: Видалити розділ
 *     tags: [WorkUpload]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/chapters/:chapterId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isOwnerOrModeratorOrAdmin(getWorkOwnerByChapterId),
    asyncHandler(workUploadController.deleteChapter)
);

module.exports = router;
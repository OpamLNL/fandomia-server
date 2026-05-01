const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');

const {
    isAuthenticated,
    isModeratorOrAdmin
} = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Скарги на контент і користувачів
 */

router.post(
    '/',
    firebaseAuthMiddleware,
    isAuthenticated,
    asyncHandler(reportController.createReport)
);

router.get(
    '/',
    firebaseAuthMiddleware,
    isAuthenticated,
    isModeratorOrAdmin,
    asyncHandler(reportController.getAllReports)
);

router.get(
    '/status/:status',
    firebaseAuthMiddleware,
    isAuthenticated,
    isModeratorOrAdmin,
    asyncHandler(reportController.getReportsByStatus)
);

router.get(
    '/user/:userId',
    firebaseAuthMiddleware,
    isAuthenticated,
    isModeratorOrAdmin,
    asyncHandler(reportController.getReportsByUserId)
);

router.get(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isModeratorOrAdmin,
    asyncHandler(reportController.getReportById)
);

router.patch(
    '/:id/status',
    firebaseAuthMiddleware,
    isAuthenticated,
    isModeratorOrAdmin,
    asyncHandler(reportController.updateReportStatus)
);

router.delete(
    '/:id',
    firebaseAuthMiddleware,
    isAuthenticated,
    isModeratorOrAdmin,
    asyncHandler(reportController.deleteReport)
);

module.exports = router;
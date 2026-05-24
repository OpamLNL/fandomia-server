const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const firebaseAuthMiddleware = require('../middlewares/firebaseAuthMiddleware');
const { isAuthenticated, isAdmin, isModeratorOrAdmin } = require('../middlewares/roleMiddleware');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.use(firebaseAuthMiddleware);
router.use(isAuthenticated);

// moderator + admin
router.get('/stats', isModeratorOrAdmin, asyncHandler(adminController.getStats));
router.get('/works', isModeratorOrAdmin, asyncHandler(adminController.getAdminWorks));
router.get('/posts', isModeratorOrAdmin, asyncHandler(adminController.getAdminPosts));
router.get('/comments', isModeratorOrAdmin, asyncHandler(adminController.getAdminComments));

router.get('/reports', isModeratorOrAdmin, asyncHandler(adminController.getReports));
router.get('/reports/status/:status', isModeratorOrAdmin, asyncHandler(adminController.getReportsByStatus));
router.patch('/reports/:id/status', isModeratorOrAdmin, asyncHandler(adminController.updateReportStatus));
router.delete('/reports/:id', isModeratorOrAdmin, asyncHandler(adminController.deleteReport));

router.patch('/works/:id/status', isModeratorOrAdmin, asyncHandler(adminController.updateWorkStatus));
router.patch('/posts/:id/status', isModeratorOrAdmin, asyncHandler(adminController.updatePostStatus));
router.patch('/comments/:id/status', isModeratorOrAdmin, asyncHandler(adminController.updateCommentStatus));
router.delete('/works/:id', isModeratorOrAdmin, asyncHandler(adminController.deleteWork));
router.delete('/posts/:id', isModeratorOrAdmin, asyncHandler(adminController.deletePost));
router.delete('/comments/:id', isModeratorOrAdmin, asyncHandler(adminController.deleteComment));

// admin only
router.get('/users', isAdmin, asyncHandler(adminController.getUsers));
router.get('/users/search', isAdmin, asyncHandler(adminController.searchUsers));
router.patch('/users/:id/role', isAdmin, asyncHandler(adminController.updateUserRole));
router.patch('/users/:id/block', isAdmin, asyncHandler(adminController.updateUserBlockedStatus));
router.delete('/users/:id', isAdmin, asyncHandler(adminController.deleteUser));

module.exports = router;

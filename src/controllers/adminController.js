const adminService = require('../services/adminService');

const getStats = async (req, res) => {
    const stats = await adminService.getStats();
    res.json(stats);
};

const getUsers = async (req, res) => {
    const users = await adminService.getUsers();
    res.json(users);
};

const searchUsers = async (req, res) => {
    const users = await adminService.searchUsers(req.query.query);
    res.json(users);
};

const updateUserRole = async (req, res) => {
    const result = await adminService.updateUserRole(req.params.id, req.body.role);
    res.json(result);
};

const updateUserBlockedStatus = async (req, res) => {
    const result = await adminService.updateUserBlockedStatus(req.params.id, req.body.is_blocked);
    res.json(result);
};

const deleteUser = async (req, res) => {
    await adminService.deleteUser(req.params.id);
    res.json({ success: true });
};

const updateWorkStatus = async (req, res) => {
    const result = await adminService.updateWorkStatus(req.params.id, req.body.status);
    res.json(result);
};

const updatePostStatus = async (req, res) => {
    const result = await adminService.updatePostStatus(req.params.id, req.body.status);
    res.json(result);
};

const updateCommentStatus = async (req, res) => {
    const result = await adminService.updateCommentStatus(req.params.id, req.body.status);
    res.json(result);
};

const deleteWork = async (req, res) => {
    await adminService.deleteWork(req.params.id);
    res.json({ success: true });
};

const deletePost = async (req, res) => {
    await adminService.deletePost(req.params.id);
    res.json({ success: true });
};

const deleteComment = async (req, res) => {
    await adminService.deleteComment(req.params.id);
    res.json({ success: true });
};

const getReports = async (req, res) => {
    const reports = await adminService.getReports();
    res.json(reports);
};

const getReportsByStatus = async (req, res) => {
    const reports = await adminService.getReportsByStatus(req.params.status);
    res.json(reports);
};

const updateReportStatus = async (req, res) => {
    const result = await adminService.updateReportStatus(req.params.id, req.body.status);
    res.json(result);
};

const deleteReport = async (req, res) => {
    await adminService.deleteReport(req.params.id);
    res.json({ success: true });
};

module.exports = {
    getStats,
    getUsers,
    searchUsers,
    updateUserRole,
    updateUserBlockedStatus,
    deleteUser,
    updateWorkStatus,
    updatePostStatus,
    updateCommentStatus,
    deleteWork,
    deletePost,
    deleteComment,
    getReports,
    getReportsByStatus,
    updateReportStatus,
    deleteReport
};
const adminRepository = require('../repositories/adminRepository');

const USER_ROLES = ['user', 'moderator', 'admin'];
const CONTENT_STATUSES = ['active', 'hidden', 'blocked'];
const REPORT_STATUSES = ['pending', 'reviewed', 'rejected', 'resolved'];

const getStats = async () => {
    return await adminRepository.getStats();
};

const getUsers = async () => {
    return await adminRepository.getUsers();
};

const searchUsers = async (query) => {
    if (!query || !query.trim()) {
        return await getUsers();
    }

    return await adminRepository.searchUsers(query.trim());
};

const updateUserRole = async (id, role) => {
    if (!USER_ROLES.includes(role)) {
        throw new Error('Некоректна роль користувача');
    }

    return await adminRepository.updateUserRole(id, role);
};

const updateUserBlockedStatus = async (id, isBlocked) => {
    return await adminRepository.updateUserBlockedStatus(id, isBlocked);
};

const deleteUser = async (id) => {
    return await adminRepository.deleteUser(id);
};

const updateWorkStatus = async (id, status) => {
    if (!CONTENT_STATUSES.includes(status)) {
        throw new Error('Некоректний статус роботи');
    }

    return await adminRepository.updateWorkStatus(id, status);
};

const updatePostStatus = async (id, status) => {
    if (!CONTENT_STATUSES.includes(status)) {
        throw new Error('Некоректний статус поста');
    }

    return await adminRepository.updatePostStatus(id, status);
};

const updateCommentStatus = async (id, status) => {
    if (!CONTENT_STATUSES.includes(status)) {
        throw new Error('Некоректний статус коментаря');
    }

    return await adminRepository.updateCommentStatus(id, status);
};

const deleteWork = async (id) => {
    return await adminRepository.deleteWork(id);
};

const deletePost = async (id) => {
    return await adminRepository.deletePost(id);
};

const deleteComment = async (id) => {
    return await adminRepository.deleteComment(id);
};

const getReports = async () => {
    return await adminRepository.getReports();
};

const getReportsByStatus = async (status) => {
    if (!REPORT_STATUSES.includes(status)) {
        throw new Error('Некоректний статус скарги');
    }

    return await adminRepository.getReportsByStatus(status);
};

const updateReportStatus = async (id, status) => {
    if (!REPORT_STATUSES.includes(status)) {
        throw new Error('Некоректний статус скарги');
    }

    return await adminRepository.updateReportStatus(id, status);
};

const deleteReport = async (id) => {
    return await adminRepository.deleteReport(id);
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
const reportRepository = require('../repositories/reportRepository');
const {
    REPORT_TARGETS,
    REPORT_STATUSES,
    createReportEntity
} = require('../models/reportModel');

const validateTargetType = (targetType) => {
    if (!Object.values(REPORT_TARGETS).includes(targetType)) {
        throw new Error('Некоректний тип обʼєкта скарги');
    }
};

const validateStatus = (status) => {
    if (!Object.values(REPORT_STATUSES).includes(status)) {
        throw new Error('Некоректний статус скарги');
    }
};

const getAllReports = async () => {
    const reports = await reportRepository.getAllReports();
    return reports.map(report => createReportEntity(report));
};

const getReportsByStatus = async (status) => {
    validateStatus(status);

    const reports = await reportRepository.getReportsByStatus(status);
    return reports.map(report => createReportEntity(report));
};

const getReportById = async (id) => {
    const report = await reportRepository.getReportById(id);

    if (!report) {
        throw new Error('Скаргу не знайдено');
    }

    return createReportEntity(report);
};

const getReportsByUserId = async (userId) => {
    const reports = await reportRepository.getReportsByUserId(userId);
    return reports.map(report => createReportEntity(report));
};

const createReport = async ({ reporter_id, target_type, target_id, reason }) => {
    if (!reporter_id) {
        throw new Error('reporter_id обовʼязковий');
    }

    if (!target_id) {
        throw new Error('target_id обовʼязковий');
    }

    if (!reason || !reason.trim()) {
        throw new Error('Причина скарги обовʼязкова');
    }

    validateTargetType(target_type);

    const report = await reportRepository.createReport({
        reporter_id,
        target_type,
        target_id,
        reason: reason.trim()
    });

    return await getReportById(report.id);
};

const updateReportStatus = async (id, status) => {
    const existing = await reportRepository.getReportById(id);

    if (!existing) {
        throw new Error('Скаргу не знайдено');
    }

    validateStatus(status);

    await reportRepository.updateReportStatus(id, status);

    return await getReportById(id);
};

const deleteReport = async (id) => {
    const existing = await reportRepository.getReportById(id);

    if (!existing) {
        throw new Error('Скаргу не знайдено');
    }

    return await reportRepository.deleteReport(id);
};

module.exports = {
    getAllReports,
    getReportsByStatus,
    getReportById,
    getReportsByUserId,
    createReport,
    updateReportStatus,
    deleteReport
};
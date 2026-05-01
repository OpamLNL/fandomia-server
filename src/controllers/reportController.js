const reportService = require('../services/reportService');

const getAllReports = async (req, res) => {
    const reports = await reportService.getAllReports();
    res.json(reports);
};

const getReportsByStatus = async (req, res) => {
    const reports = await reportService.getReportsByStatus(req.params.status);
    res.json(reports);
};

const getReportById = async (req, res) => {
    const report = await reportService.getReportById(req.params.id);
    res.json(report);
};

const getReportsByUserId = async (req, res) => {
    const reports = await reportService.getReportsByUserId(req.params.userId);
    res.json(reports);
};

const createReport = async (req, res) => {
    const report = await reportService.createReport({
        reporter_id: req.user.id,
        target_type: req.body.target_type,
        target_id: req.body.target_id,
        reason: req.body.reason
    });

    res.status(201).json(report);
};

const updateReportStatus = async (req, res) => {
    const report = await reportService.updateReportStatus(req.params.id, req.body.status);
    res.json(report);
};

const deleteReport = async (req, res) => {
    await reportService.deleteReport(req.params.id);
    res.json({ success: true });
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
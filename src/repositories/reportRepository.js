const { query } = require('../config/database');

const getAllReports = async () => {
    return await query(`
        SELECT 
            r.*,
            u.name AS reporter_name,
            u.avatar_url AS reporter_avatar
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        ORDER BY r.created_at DESC
    `);
};

const getReportsByStatus = async (status) => {
    return await query(`
        SELECT 
            r.*,
            u.name AS reporter_name,
            u.avatar_url AS reporter_avatar
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        WHERE r.status = ?
        ORDER BY r.created_at DESC
    `, [status]);
};

const getReportById = async (id) => {
    const rows = await query(`
        SELECT 
            r.*,
            u.name AS reporter_name,
            u.avatar_url AS reporter_avatar
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        WHERE r.id = ?
    `, [id]);

    return rows[0];
};

const getReportsByUserId = async (userId) => {
    return await query(`
        SELECT *
        FROM reports
        WHERE reporter_id = ?
        ORDER BY created_at DESC
    `, [userId]);
};

const createReport = async ({ reporter_id, target_type, target_id, reason }) => {
    const result = await query(`
        INSERT INTO reports (reporter_id, target_type, target_id, reason, status)
        VALUES (?, ?, ?, ?, 'pending')
    `, [reporter_id, target_type, target_id, reason]);

    return {
        id: result.insertId,
        reporter_id,
        target_type,
        target_id,
        reason,
        status: 'pending'
    };
};

const updateReportStatus = async (id, status) => {
    await query(`
        UPDATE reports
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const deleteReport = async (id) => {
    await query(`
        DELETE FROM reports
        WHERE id = ?
    `, [id]);

    return { id };
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
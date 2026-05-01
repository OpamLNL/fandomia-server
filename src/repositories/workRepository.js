const { query } = require('../config/database');

const getAllWorks = async () => {
    return await query(`
        SELECT *
        FROM works
        WHERE status = 'active'
        ORDER BY created_at DESC
    `);
};

const getWorkById = async (id) => {
    const rows = await query(`
        SELECT *
        FROM works
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const getWorksByUserId = async (userId) => {
    return await query(`
        SELECT *
        FROM works
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [userId]);
};

const createWork = async (data) => {
    const result = await query(`
        INSERT INTO works (user_id, fandom_id, title, description, type, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    `, [
        data.user_id,
        data.fandom_id,
        data.title,
        data.description,
        data.type || 'fanfic'
    ]);

    return { id: result.insertId };
};

const updateWork = async (id, data) => {
    await query(`
        UPDATE works
        SET title = ?, description = ?, type = ?
        WHERE id = ?
    `, [
        data.title,
        data.description,
        data.type,
        id
    ]);

    return { id };
};

const updateWorkStatus = async (id, status) => {
    await query(`
        UPDATE works
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return { id, status };
};

const deleteWork = async (id) => {
    await query(`DELETE FROM works WHERE id = ?`, [id]);
};

module.exports = {
    getAllWorks,
    getWorkById,
    getWorksByUserId,
    createWork,
    updateWork,
    updateWorkStatus,
    deleteWork
};
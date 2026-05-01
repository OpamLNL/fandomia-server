const { query } = require('../config/database');

const getImagesByWorkId = async (workId) => {
    return await query(`
        SELECT *
        FROM work_images
        WHERE work_id = ?
        ORDER BY order_index ASC
    `, [workId]);
};

const getImageById = async (id) => {
    const rows = await query(`
        SELECT *
        FROM work_images
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const createWorkImage = async ({ work_id, image_path, order_index }) => {
    const result = await query(`
        INSERT INTO work_images (work_id, image_path, order_index)
        VALUES (?, ?, ?)
    `, [
        work_id,
        image_path,
        order_index || 0
    ]);

    return {
        id: result.insertId,
        work_id,
        image_path,
        order_index: order_index || 0
    };
};

const deleteWorkImage = async (id) => {
    await query(`
        DELETE FROM work_images
        WHERE id = ?
    `, [id]);

    return { id };
};

module.exports = {
    getImagesByWorkId,
    getImageById,
    createWorkImage,
    deleteWorkImage
};
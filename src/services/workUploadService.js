const fs = require('fs');
const path = require('path');

const fileUploadService = require('./fileUploadService');
const workRepository = require('../repositories/workRepository');
const workImageRepository = require('../repositories/workImageRepository');
const chapterRepository = require('../repositories/chapterRepository');

const checkBlockedUser = (user) => {
    if (user?.is_blocked) {
        throw new Error('Користувач заблокований');
    }
};

const getWorkOrFail = async (workId) => {
    const work = await workRepository.getWorkById(workId);

    if (!work) {
        throw new Error('Роботу не знайдено');
    }

    return work;
};

const uploadWorkImages = async (workId, files, user) => {
    checkBlockedUser(user);

    await getWorkOrFail(workId);

    if (!files || files.length === 0) {
        throw new Error('Файли зображень не передано');
    }

    const existingImages = await workImageRepository.getImagesByWorkId(workId);
    const startIndex = existingImages.length;

    const savedImages = [];

    for (let i = 0; i < files.length; i++) {
        const imagePath = await fileUploadService.saveWorkImage(workId, files[i]);

        const image = await workImageRepository.createWorkImage({
            work_id: workId,
            image_path: imagePath,
            order_index: startIndex + i
        });

        savedImages.push(image);
    }

    return savedImages;
};

const createWorkChapter = async (workId, { title, content, order_index }, user) => {
    checkBlockedUser(user);

    await getWorkOrFail(workId);

    if (!content || !content.trim()) {
        throw new Error('Текст розділу обовʼязковий');
    }

    const chapterFile = await fileUploadService.saveWorkChapter(
        workId,
        title || 'Розділ',
        content,
        order_index || 0
    );

    return await chapterRepository.createChapter({
        work_id: workId,
        title: chapterFile.title,
        content_path: chapterFile.content_path,
        order_index: chapterFile.order_index
    });
};

const getWorkImages = async (workId) => {
    await getWorkOrFail(workId);
    return await workImageRepository.getImagesByWorkId(workId);
};

const getWorkChapters = async (workId) => {
    await getWorkOrFail(workId);
    return await chapterRepository.getChaptersByWorkId(workId);
};

const getChapterContent = async (chapterId) => {
    const chapter = await chapterRepository.getChapterById(chapterId);

    if (!chapter) {
        throw new Error('Розділ не знайдено');
    }

    const absolutePath = path.resolve(__dirname, '..', '..', chapter.content_path.replace(/^\/+/, ''));

    if (!fs.existsSync(absolutePath)) {
        throw new Error('Файл розділу не знайдено');
    }

    const content = fs.readFileSync(absolutePath, 'utf8');

    return {
        ...chapter,
        content
    };
};

const updateChapterContent = async (chapterId, { title, content, order_index }, user) => {
    checkBlockedUser(user);

    const chapter = await chapterRepository.getChapterById(chapterId);

    if (!chapter) {
        throw new Error('Розділ не знайдено');
    }

    if (!content || !content.trim()) {
        throw new Error('Текст розділу обовʼязковий');
    }

    const savedChapter = await fileUploadService.saveWorkChapter(
        chapter.work_id,
        title || chapter.title || 'Розділ',
        content,
        order_index || chapter.order_index || 0
    );

    await chapterRepository.updateChapter(chapterId, {
        title: savedChapter.title,
        content_path: savedChapter.content_path,
        order_index: savedChapter.order_index
    });

    return await getChapterContent(chapterId);
};

const deleteWorkImage = async (imageId) => {
    const image = await workImageRepository.getImageById(imageId);

    if (!image) {
        throw new Error('Зображення не знайдено');
    }

    const absolutePath = path.resolve(__dirname, '..', '..', image.image_path.replace(/^\/+/, ''));

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }

    return await workImageRepository.deleteWorkImage(imageId);
};

const deleteChapter = async (chapterId) => {
    const chapter = await chapterRepository.getChapterById(chapterId);

    if (!chapter) {
        throw new Error('Розділ не знайдено');
    }

    const absolutePath = path.resolve(__dirname, '..', '..', chapter.content_path.replace(/^\/+/, ''));

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }

    return await chapterRepository.deleteChapter(chapterId);
};

module.exports = {
    uploadWorkImages,
    createWorkChapter,
    getWorkImages,
    getWorkChapters,
    getChapterContent,
    updateChapterContent,
    deleteWorkImage,
    deleteChapter
};
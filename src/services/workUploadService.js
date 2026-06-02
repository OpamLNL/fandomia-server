const fs = require('fs');
const path = require('path');

const fileUploadService = require('./fileUploadService');
const imgbbService = require('./imgbbService');
const workRepository = require('../repositories/workRepository');
const workImageRepository = require('../repositories/workImageRepository');
const chapterRepository = require('../repositories/chapterRepository');
const { isServerlessUploads } = require('../utils/uploadPaths');

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

const readChapterContentFromFile = (contentPath) => {
    if (!contentPath) return null;

    const absolutePath = path.resolve(__dirname, '..', '..', contentPath.replace(/^\/+/, ''));

    if (!fs.existsSync(absolutePath)) {
        return null;
    }

    return fs.readFileSync(absolutePath, 'utf8');
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
        const uploaded = await fileUploadService.saveWorkImage(workId, files[i]);

        const image = await workImageRepository.createWorkImage({
            work_id: workId,
            image_path: uploaded.url,
            delete_url: uploaded.deleteUrl,
            order_index: startIndex + i,
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

    let content_path = '';

    if (!isServerlessUploads()) {
        const chapterFile = await fileUploadService.saveWorkChapter(
            workId,
            title || 'Розділ',
            content,
            order_index || 0
        );
        content_path = chapterFile.content_path;
    }

    return await chapterRepository.createChapter({
        work_id: workId,
        title: title || 'Розділ',
        content_path,
        content: content.trim(),
        order_index: order_index || 0,
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

    if (chapter.content?.trim()) {
        return {
            ...chapter,
            content: chapter.content,
        };
    }

    const fileContent = readChapterContentFromFile(chapter.content_path);

    if (fileContent != null) {
        await chapterRepository.updateChapter(chapterId, {
            title: chapter.title,
            content_path: chapter.content_path,
            content: fileContent,
            order_index: chapter.order_index || 0,
        });

        return {
            ...chapter,
            content: fileContent,
        };
    }

    throw new Error('Текст розділу недоступний. Відредагуй розділ і збережи знову.');
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

    let content_path = chapter.content_path || '';

    if (!isServerlessUploads()) {
        const savedChapter = await fileUploadService.saveWorkChapter(
            chapter.work_id,
            title || chapter.title || 'Розділ',
            content,
            order_index ?? chapter.order_index ?? 0
        );
        content_path = savedChapter.content_path;
    }

    const updated = await chapterRepository.updateChapter(chapterId, {
        title: title || chapter.title || 'Розділ',
        content_path,
        content: content.trim(),
        order_index: order_index ?? chapter.order_index ?? 0,
    });

    return {
        ...updated,
        content: content.trim(),
    };
};

const deleteWorkImage = async (imageId) => {
    const image = await workImageRepository.getImageById(imageId);

    if (!image) {
        throw new Error('Зображення не знайдено');
    }

    if (image.delete_url) {
        await imgbbService.deleteByUrl(image.delete_url);
    } else if (imgbbService.isLocalUploadPath(image.image_path)) {
        const absolutePath = path.resolve(__dirname, '..', '..', image.image_path.replace(/^\/+/, ''));

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    }

    return await workImageRepository.deleteWorkImage(imageId);
};

const deleteChapter = async (chapterId) => {
    const chapter = await chapterRepository.getChapterById(chapterId);

    if (!chapter) {
        throw new Error('Розділ не знайдено');
    }

    if (chapter.content_path) {
        const absolutePath = path.resolve(__dirname, '..', '..', chapter.content_path.replace(/^\/+/, ''));

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
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
    deleteChapter,
};

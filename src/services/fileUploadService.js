const fs = require('fs');
const path = require('path');

const UPLOADS_ROOT = path.resolve(__dirname, '..', '..', 'uploads');

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const getWorkFolder = (workId) => {
    return path.join(UPLOADS_ROOT, 'works', String(workId));
};

const getWorkImagesFolder = (workId) => {
    return path.join(getWorkFolder(workId), 'images');
};

const getWorkChaptersFolder = (workId) => {
    return path.join(getWorkFolder(workId), 'chapters');
};

const getPublicPath = (absolutePath) => {
    return absolutePath
        .replace(path.resolve(__dirname, '..', '..'), '')
        .replace(/\\/g, '/');
};

const saveWorkImage = async (workId, file) => {
    const imagesDir = getWorkImagesFolder(workId);
    ensureDir(imagesDir);

    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(imagesDir, fileName);

    fs.renameSync(file.path, filePath);

    return getPublicPath(filePath);
};

const saveWorkChapter = async (workId, title, content, orderIndex) => {
    const chaptersDir = getWorkChaptersFolder(workId);
    ensureDir(chaptersDir);

    const fileName = `${orderIndex || Date.now()}.md`;
    const filePath = path.join(chaptersDir, fileName);

    fs.writeFileSync(filePath, content, 'utf8');

    return {
        title,
        content_path: getPublicPath(filePath),
        order_index: orderIndex || 0
    };
};

module.exports = {
    saveWorkImage,
    saveWorkChapter
};
const express = require('express');
const router = express.Router();


const userRoutes = require('./userRoutes');
const workRoutes = require('./workRoutes');
const fandomRoutes = require('./fandomRoutes');
const fandomCatalogTagRoutes = require('./fandomCatalogTagRoutes');
const postRoutes = require('./postRoutes');
const tagRoutes = require('./tagRoutes');
const commentRoutes = require('./commentRoutes');
const likeRoutes = require('./likeRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const followRoutes = require('./followRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');
const workUploadRoutes = require('./workUploadRoutes');
const contactRoutes = require('./contactRoutes');



router.use('/api/users', userRoutes);
router.use('/api/works', workRoutes);
router.use('/api/fandoms', fandomRoutes);
router.use('/api/fandom-catalog-tags', fandomCatalogTagRoutes);
router.use('/api/posts', postRoutes);
router.use('/api/tags', tagRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/likes', likeRoutes);
router.use('/api/favorites', favoriteRoutes);
router.use('/api/follows', followRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/reports', reportRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/work-upload', workUploadRoutes);
router.use('/api/contact', contactRoutes);


module.exports = router;
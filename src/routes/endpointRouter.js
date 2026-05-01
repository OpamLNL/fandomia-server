const express = require('express');
const router = express.Router();


const userRoutes = require('./userRoutes');
const workRoutes = require('./workRoutes');
const fandomRoutes = require('./fandomRoutes');
const postRoutes = require('./postRoutes');
const tagRoutes = require('./tagRoutes');
const commentRoutes = require('./commentRoutes');
const likeRoutes = require('./likeRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');



router.use('/api/users', userRoutes);
router.use('/api/works', workRoutes);
router.use('/api/fandoms', fandomRoutes);
router.use('/api/posts', postRoutes);
router.use('/api/tags', tagRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/likes', likeRoutes);
router.use('/api/favorites', favoriteRoutes);
router.use('/api/reports', reportRoutes);
router.use('/api/admin', adminRoutes);


module.exports = router;
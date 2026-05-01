// const admin = require('../../firebase-admin');
// const userRepository = require('../repositories/userRepository');
//
// const firebaseAuthMiddleware = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
//
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({ error: 'Токен не передано' });
//         }
//
//         const token = authHeader.split(' ')[1];
//         const decodedToken = await admin.auth().verifyIdToken(token);
//
//         let user = await userRepository.getUserByFirebaseUid(decodedToken.uid);
//
//         if (!user) {
//             user = await userRepository.createUser({
//                 firebase_uid: decodedToken.uid,
//                 email: decodedToken.email || null,
//                 name: decodedToken.name || decodedToken.email || 'Новий користувач',
//                 avatar_url: decodedToken.picture || '/images/users/default_avatar.png',
//                 role: 'user'
//             });
//         }
//
//         req.user = user;
//         next();
//     } catch (error) {
//         console.error('Firebase auth error:', error);
//         res.status(401).json({ error: 'Недійсний або прострочений токен' });
//     }
// };
//
// module.exports = firebaseAuthMiddleware;


const firebaseAuthMiddleware = async (req, res, next) => {
    req.user = {
        id: 1,
        role: 'admin'
    };

    next();
};

module.exports = firebaseAuthMiddleware;
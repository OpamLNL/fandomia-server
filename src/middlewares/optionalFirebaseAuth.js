const admin = require('../../firebase-admin');
const userRepository = require('../repositories/userRepository');

async function optionalFirebaseAuth(req, res, next) {
    req.viewer = null;

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        const user = await userRepository.getUserByFirebaseUid(decoded.uid);

        if (user) {
            req.viewer = {
                id: user.id,
                show_mature_content: Boolean(user.show_mature_content),
                role: (user.role || 'user').toLowerCase(),
            };
        }
    } catch {
        // Публічний доступ без viewer
    }

    next();
}

module.exports = optionalFirebaseAuth;

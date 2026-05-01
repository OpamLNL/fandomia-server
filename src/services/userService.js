const userRepository = require('../repositories/userRepository');
const { generateTokens } = require('../services/authService');
const { USER_ROLES, createUserEntity } = require('../models/userModel');

const DEFAULT_AVATAR = '/images/users/default_avatar.png';

const getUserById = async (userId) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new Error('Користувача не знайдено');

    const stats = await userRepository.getUserStats(userId);

    return createUserEntity({ ...user, ...stats });
};

const getUserByFirebaseUid = async (firebaseUid) => {
    const user = await userRepository.getUserByFirebaseUid(firebaseUid);

    if (!user) throw new Error('Користувача не знайдено');

    return createUserEntity(user);
};

const getUserByEmail = async (email) => {
    const user = await userRepository.getUserByEmail(email);

    if (!user) throw new Error('Користувача не знайдено');

    return createUserEntity(user);
};

const getAllUsers = async () => {
    const users = await userRepository.getAllUsers();
    return users.map(user => createUserEntity(user));
};

const searchUsers = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) {
        return await getAllUsers();
    }

    const users = await userRepository.searchUsers(searchQuery.trim());
    return users.map(user => createUserEntity(user));
};

const getUserWorks = async (userId) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new Error('Користувача не знайдено');

    return await userRepository.getUserWorks(userId);
};

const getUserPosts = async (userId) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new Error('Користувача не знайдено');

    return await userRepository.getUserPosts(userId);
};

const getUserComments = async (userId) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new Error('Користувача не знайдено');

    return await userRepository.getUserComments(userId);
};

const getUserStats = async (userId) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new Error('Користувача не знайдено');

    return await userRepository.getUserStats(userId);
};

const createUser = async ({ firebase_uid, email, name, avatar_url, role }) => {
    if (!firebase_uid) throw new Error('Firebase UID обовʼязковий');

    if (role && !Object.values(USER_ROLES).includes(role)) {
        throw new Error('Некоректна роль користувача');
    }

    const existing = await userRepository.getUserByFirebaseUid(firebase_uid);

    if (existing) {
        return createUserEntity(existing);
    }

    const user = await userRepository.createUser({
        firebase_uid,
        email: email || null,
        name: name || 'Новий користувач',
        avatar_url: avatar_url || DEFAULT_AVATAR,
        role: role || USER_ROLES.USER
    });

    return createUserEntity(user);
};

const createUserAndAuthenticate = async (req, res) => {
    try {
        const { firebase_uid, email, name, avatar_url } = req.body;

        const user = await createUser({
            firebase_uid,
            email,
            name,
            avatar_url,
            role: USER_ROLES.USER
        });

        const { accessToken, refreshToken } = generateTokens(user.id);

        res.status(201).json({
            user,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Помилка створення користувача:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (userId, userData) => {
    const existing = await userRepository.getUserById(userId);

    if (!existing) throw new Error('Користувача не знайдено');

    await userRepository.updateUser(userId, {
        email: userData.email || existing.email,
        name: userData.name || existing.name,
        avatar_url: userData.avatar_url || existing.avatar_url
    });

    return await getUserById(userId);
};

const updateUserRole = async (userId, role) => {
    const existing = await userRepository.getUserById(userId);

    if (!existing) throw new Error('Користувача не знайдено');

    if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error('Некоректна роль користувача');
    }

    await userRepository.updateUserRole(userId, role);

    return await getUserById(userId);
};

const updateUserBlockedStatus = async (userId, isBlocked) => {
    const existing = await userRepository.getUserById(userId);

    if (!existing) throw new Error('Користувача не знайдено');

    await userRepository.updateUserBlockedStatus(userId, Boolean(isBlocked));

    return await getUserById(userId);
};

const deleteUser = async (userId) => {
    const existing = await userRepository.getUserById(userId);

    if (!existing) throw new Error('Користувача не знайдено');

    await userRepository.deleteUser(userId);

    return { id: userId };
};

module.exports = {
    getUserById,
    getUserByFirebaseUid,
    getUserByEmail,
    getAllUsers,
    searchUsers,
    getUserWorks,
    getUserPosts,
    getUserComments,
    getUserStats,
    createUser,
    createUserAndAuthenticate,
    updateUser,
    updateUserRole,
    updateUserBlockedStatus,
    deleteUser
};
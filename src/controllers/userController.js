const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
};

const getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
};

const getUserByFirebaseUid = async (req, res) => {
    const user = await userService.getUserByFirebaseUid(req.params.firebaseUid);
    res.json(user);
};

const getUserByEmail = async (req, res) => {
    const user = await userService.getUserByEmail(req.params.email);
    res.json(user);
};

const searchUsers = async (req, res) => {
    const users = await userService.searchUsers(req.query.query);
    res.json(users);
};

const getUserWorks = async (req, res) => {
    const works = await userService.getUserWorks(req.params.id);
    res.json(works);
};

const getUserPosts = async (req, res) => {
    const posts = await userService.getUserPosts(req.params.id);
    res.json(posts);
};

const getUserComments = async (req, res) => {
    const comments = await userService.getUserComments(req.params.id);
    res.json(comments);
};

const getUserStats = async (req, res) => {
    const stats = await userService.getUserStats(req.params.id);
    res.json(stats);
};

const getMe = async (req, res) => {
    const user = await userService.getUserById(req.user.id);
    res.json(user);
};

const getMyWorks = async (req, res) => {
    const works = await userService.getUserWorks(req.user.id);
    res.json(works);
};

const getMyPosts = async (req, res) => {
    const posts = await userService.getUserPosts(req.user.id);
    res.json(posts);
};

const getMyComments = async (req, res) => {
    const comments = await userService.getUserComments(req.user.id);
    res.json(comments);
};

const getMyReceivedComments = async (req, res) => {
    const comments = await userService.getReceivedComments(req.user.id);
    res.json(comments);
};

const createUser = async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
};

const createUserAndAuthenticate = async (req, res) => {
    await userService.createUserAndAuthenticate(req, res);
};

const updateUser = async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
};

const updateMe = async (req, res) => {
    const user = await userService.updateUser(req.user.id, req.body);
    res.json(user);
};

const uploadAvatar = async (req, res) => {
    const user = await userService.uploadUserAvatar(req.params.id, req.file, req.user);
    res.json(user);
};

const uploadMyAvatar = async (req, res) => {
    const user = await userService.uploadUserAvatar(req.user.id, req.file, req.user);
    res.json(user);
};

const updateUserRole = async (req, res) => {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.json(user);
};

const updateUserBlockedStatus = async (req, res) => {
    const user = await userService.updateUserBlockedStatus(req.params.id, req.body.is_blocked);
    res.json(user);
};

const deleteUser = async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ success: true });
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByFirebaseUid,
    getUserByEmail,
    searchUsers,
    getUserWorks,
    getUserPosts,
    getUserComments,
    getUserStats,
    getMe,
    getMyWorks,
    getMyPosts,
    getMyComments,
    getMyReceivedComments,
    createUser,
    createUserAndAuthenticate,
    updateUser,
    updateMe,
    uploadAvatar,
    uploadMyAvatar,
    updateUserRole,
    updateUserBlockedStatus,
    deleteUser
};
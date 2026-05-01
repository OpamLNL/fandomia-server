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
    createUser,
    createUserAndAuthenticate,
    updateUser,
    updateUserRole,
    updateUserBlockedStatus,
    deleteUser
};
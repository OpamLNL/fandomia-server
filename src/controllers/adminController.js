const userModel = require('../models/userModel');
const gamesModel = require('../models/gamesModel');
const newsModel = require('../models/workModel');
const tagsModel = require('../models/tagsModel');
const commentsModel = require('../models/commentsModel');
const likesModel = require('../models/likesModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY;

// Users Handlers
const getUserById = async (req, res) => {
    try {
        const user = await userModel.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, avatar, birth_date, bio, phone_number, language, timezone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.createUser({
            username, email, password: hashedPassword, avatar: avatar || 'default_avatar.png', birth_date, bio, phone_number, language, timezone, status: 'active', last_visit: new Date()
        });
        const token = jwt.sign({ id: newUser.id, username: newUser.username }, secretKey, { expiresIn: '24h' });
        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const updatedUser = await userModel.updateUser(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userModel.deleteUser(req.params.id);
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Games Handlers
const getAllGames = async (req, res) => {
    try {
        const games = await gamesModel.getAllGames();
        res.status(200).json(games);
    } catch (error) {
        console.error('Error getting all games:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createGame = async (req, res) => {
    try {
        const newGame = await gamesModel.createGame(req.body);
        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateGame = async (req, res) => {
    try {
        const updatedGame = await gamesModel.updateGame(req.params.id, req.body);
        res.status(200).json(updatedGame);
    } catch (error) {
        console.error('Error updating game:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteGame = async (req, res) => {
    try {
        await gamesModel.deleteGame(req.params.id);
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Add similar handlers for news, tags, comments, and likes using corresponding models

module.exports = {
    getUserById,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    // News Handlers
    getAllNews,
    createNews,
    updateNews,
    deleteNews,

    // Games Handlers
    getAllGames,
    createGame,
    updateGame,
    deleteGame,

    // Tags Handlers
    getAllTags,
    createTag,
    updateTag,
    deleteTag,

    // Comments Handlers
    getAllComments,
    createComment,
    updateComment,
    deleteComment,

    // Likes Handlers
    getAllLikes,
    addLike,
    removeLike
};

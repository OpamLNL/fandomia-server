const favoriteService = require('../services/favoriteService');

const toggleFavorite = async (req, res) => {
    const result = await favoriteService.toggleFavorite(
        {
            user_id: req.user.id,
            target_type: req.body.target_type,
            target_id: req.body.target_id
        },
        req.user
    );

    res.json(result);
};

const getUserFavorites = async (req, res) => {
    const favorites = await favoriteService.getUserFavorites(req.params.userId);
    res.json(favorites);
};

module.exports = {
    toggleFavorite,
    getUserFavorites
};
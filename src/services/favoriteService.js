const favoriteRepository = require('../repositories/favoriteRepository');
const { FAVORITE_TARGETS, createFavoriteEntity } = require('../models/favoriteModel');

const validateTargetType = (targetType) => {
    if (!Object.values(FAVORITE_TARGETS).includes(targetType)) {
        throw new Error('Некоректний тип обраного');
    }
};

const toggleFavorite = async ({ user_id, target_type, target_id }) => {
    if (user?.is_blocked) {
        throw new Error('Користувач заблокований');
    }

    if (!user_id) {
        throw new Error('user_id обовʼязковий');
    }

    if (!target_id) {
        throw new Error('target_id обовʼязковий');
    }

    validateTargetType(target_type);

    const existing = await favoriteRepository.getFavorite(user_id, target_type, target_id);

    if (existing) {
        await favoriteRepository.deleteFavorite(user_id, target_type, target_id);

        return {
            favorite: false
        };
    }

    await favoriteRepository.createFavorite(user_id, target_type, target_id);

    return {
        favorite: true
    };
};

const getUserFavorites = async (userId) => {
    const favorites = await favoriteRepository.getUserFavorites(userId);
    return favorites.map(favorite => createFavoriteEntity(favorite));
};

module.exports = {
    toggleFavorite,
    getUserFavorites
};
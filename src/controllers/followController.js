const followService = require('../services/followService');

const toggleFollow = async (req, res) => {
    const result = await followService.toggleFollow(
        {
            follower_id: req.user.id,
            following_id: req.body.following_id,
        },
        req.user
    );
    res.json(result);
};

const checkFollowing = async (req, res) => {
    const result = await followService.isFollowing(req.user.id, req.params.userId);
    res.json(result);
};

const getFollowing = async (req, res) => {
    const users = await followService.getFollowing(req.user.id);
    res.json(users);
};

const getFeed = async (req, res) => {
    const feed = await followService.getFeed(req.user.id);
    res.json(feed);
};

const markFeedSeen = async (req, res) => {
    const result = await followService.markFeedSeen(req.user.id);
    res.json(result);
};

module.exports = {
    toggleFollow,
    checkFollowing,
    getFollowing,
    getFeed,
    markFeedSeen,
};

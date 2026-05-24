const followRepository = require('../repositories/followRepository');
const userRepository = require('../repositories/userRepository');
const notificationService = require('./notificationService');

const toggleFollow = async ({ follower_id, following_id }, user) => {
    if (user?.is_blocked) {
        throw new Error('Користувач заблокований');
    }

    if (!follower_id || !following_id) {
        throw new Error('follower_id та following_id обовʼязкові');
    }

    if (Number(follower_id) === Number(following_id)) {
        throw new Error('Не можна слідкувати за собою');
    }

    const target = await userRepository.getUserById(following_id);
    if (!target) {
        throw new Error('Користувача не знайдено');
    }

    if (target.is_blocked) {
        throw new Error('Цей користувач недоступний');
    }

    const existing = await followRepository.getFollow(follower_id, following_id);

    if (existing) {
        await followRepository.deleteFollow(follower_id, following_id);
        return { following: false };
    }

    await followRepository.createFollow(follower_id, following_id);

    notificationService.notifyFollow({ follower_id, following_id });

    return { following: true };
};

const isFollowing = async (followerId, followingId) => {
    const existing = await followRepository.getFollow(followerId, followingId);
    return { following: !!existing };
};

const getFollowing = async (followerId) => {
    return followRepository.getFollowingUsers(followerId);
};

const resolveSinceDate = (feedLastSeenAt, userCreatedAt) => {
    if (feedLastSeenAt) {
        return new Date(feedLastSeenAt);
    }

    const fallback = new Date();
    fallback.setDate(fallback.getDate() - 14);
    const created = userCreatedAt ? new Date(userCreatedAt) : fallback;
    return created > fallback ? created : fallback;
};

const getFeed = async (userId) => {
    const userRow = await followRepository.getFeedLastSeenAt(userId);
    if (!userRow) {
        throw new Error('Користувача не знайдено');
    }

    const since = resolveSinceDate(userRow.feed_last_seen_at, userRow.created_at);
    const activity = await followRepository.getFeedActivity(userId, since);
    const unseenCount =
        activity.works.length + activity.posts.length + activity.comments.length;

    return {
        since: since.toISOString(),
        unseen_count: unseenCount,
        ...activity,
    };
};

const markFeedSeen = async (userId) => {
    await followRepository.markFeedSeen(userId);
    return { ok: true };
};

module.exports = {
    toggleFollow,
    isFollowing,
    getFollowing,
    getFeed,
    markFeedSeen,
};

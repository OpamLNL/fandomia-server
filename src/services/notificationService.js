const notificationRepository = require('../repositories/notificationRepository');
const workRepository = require('../repositories/workRepository');
const postRepository = require('../repositories/postRepository');
const commentRepository = require('../repositories/commentRepository');

const resolveContentOwner = async (targetType, targetId) => {
    if (targetType === 'work') {
        const work = await workRepository.getWorkById(targetId);
        return work?.user_id ?? null;
    }
    if (targetType === 'post') {
        const post = await postRepository.getPostById(targetId);
        return post?.user_id ?? null;
    }
    if (targetType === 'comment') {
        const comment = await commentRepository.getCommentById(targetId);
        return comment?.user_id ?? null;
    }
    return null;
};

const resolveCommentTargetOwner = async (targetType, targetId) => {
    return resolveContentOwner(targetType, targetId);
};

const createIfNotSelf = async ({ recipientId, actorId, type, targetType, targetId, preview }) => {
    if (!recipientId || !actorId || Number(recipientId) === Number(actorId)) {
        return null;
    }

    return notificationRepository.createNotification({
        user_id: recipientId,
        actor_id: actorId,
        type,
        target_type: targetType,
        target_id: targetId,
        preview,
    });
};

const notifyLike = async ({ actor_id, target_type, target_id }) => {
    try {
        const ownerId = await resolveContentOwner(target_type, target_id);
        if (!ownerId) return;

        let preview = null;
        if (target_type === 'work') {
            const work = await workRepository.getWorkById(target_id);
            preview = work?.title || null;
        } else if (target_type === 'post') {
            const post = await postRepository.getPostById(target_id);
            preview = post?.title || null;
        } else if (target_type === 'comment') {
            const comment = await commentRepository.getCommentById(target_id);
            preview = comment?.content?.slice(0, 120) || null;
        }

        await createIfNotSelf({
            recipientId: ownerId,
            actorId: actor_id,
            type: 'like',
            targetType: target_type,
            targetId: target_id,
            preview,
        });
    } catch (err) {
        console.error('notifyLike error:', err.message);
    }
};

const notifyComment = async ({ actor_id, target_type, target_id, content }) => {
    try {
        const ownerId = await resolveCommentTargetOwner(target_type, target_id);
        if (!ownerId) return;

        await createIfNotSelf({
            recipientId: ownerId,
            actorId: actor_id,
            type: 'comment',
            targetType: target_type,
            targetId: target_id,
            preview: content?.slice(0, 120) || null,
        });
    } catch (err) {
        console.error('notifyComment error:', err.message);
    }
};

const notifyFollow = async ({ follower_id, following_id }) => {
    try {
        await createIfNotSelf({
            recipientId: following_id,
            actorId: follower_id,
            type: 'follow',
            targetType: 'user',
            targetId: follower_id,
            preview: null,
        });
    } catch (err) {
        console.error('notifyFollow error:', err.message);
    }
};

const getUserNotifications = async (userId) => {
    return notificationRepository.getUserNotifications(userId);
};

const getUnreadCount = async (userId) => {
    return notificationRepository.getUnreadCount(userId);
};

const markAsRead = async (userId, notificationId) => {
    await notificationRepository.markAsRead(userId, notificationId);
    return { ok: true };
};

const markAllAsRead = async (userId) => {
    await notificationRepository.markAllAsRead(userId);
    return { ok: true };
};

module.exports = {
    notifyLike,
    notifyComment,
    notifyFollow,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};

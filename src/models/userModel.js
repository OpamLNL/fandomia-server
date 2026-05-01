const USER_ROLES = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin'
};

const createUserEntity = ({
                              id,
                              firebase_uid,
                              email,
                              name,
                              avatar_url,
                              role,
                              is_blocked,
                              created_at,
                              works_count,
                              posts_count,
                              comments_count,
                              likes_count
                          }) => ({
    id,
    firebase_uid,
    email,
    name,
    avatar_url,
    role,
    is_blocked: Boolean(is_blocked),
    created_at,
    works_count: works_count || 0,
    posts_count: posts_count || 0,
    comments_count: comments_count || 0,
    likes_count: likes_count || 0
});

module.exports = {
    USER_ROLES,
    createUserEntity
};
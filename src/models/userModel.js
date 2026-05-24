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
                              likes_count,
                              likes_received_count,
                              favorites_count,
                              followers_count,
                              following_count,
                              show_mature_content
                          }) => ({
    id,
    firebase_uid,
    email,
    name,
    avatar_url,
    role,
    is_blocked: Boolean(is_blocked),
    created_at,
    works_count: Number(works_count ?? 0),
    posts_count: Number(posts_count ?? 0),
    comments_count: Number(comments_count ?? 0),
    likes_count: Number(likes_count ?? 0),
    likes_received_count: Number(likes_received_count ?? 0),
    favorites_count: Number(favorites_count ?? 0),
    followers_count: Number(followers_count ?? 0),
    following_count: Number(following_count ?? 0),
    show_mature_content: Boolean(show_mature_content),
});

module.exports = {
    USER_ROLES,
    createUserEntity
};
const COMMENT_TARGETS = {
    WORK: 'work',
    POST: 'post'
};

const createCommentEntity = ({
                                 id,
                                 user_id,
                                 target_type,
                                 target_id,
                                 content,
                                 created_at,
                                 author_name,
                                 author_avatar
                             }) => ({
    id,
    user_id,
    target_type,
    target_id,
    content,
    created_at,
    author_name,
    author_avatar
});

module.exports = {
    COMMENT_TARGETS,
    createCommentEntity
};
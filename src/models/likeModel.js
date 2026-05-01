const LIKE_TARGETS = {
    WORK: 'work',
    POST: 'post',
    COMMENT: 'comment'
};

const createLikeEntity = ({
                              user_id,
                              target_type,
                              target_id,
                              created_at
                          }) => ({
    user_id,
    target_type,
    target_id,
    created_at
});

module.exports = {
    LIKE_TARGETS,
    createLikeEntity
};
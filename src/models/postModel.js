const POST_TYPES = {
    DISCUSSION: 'discussion',
    QUESTION: 'question',
    NEWS: 'news'
};

const createPostEntity = ({
                              id,
                              user_id,
                              fandom_id,
                              title,
                              content,
                              type,
                              created_at,
                              author_name,
                              author_avatar,
                              fandom_name,
                              tags
                          }) => ({
    id,
    user_id,
    fandom_id,
    title,
    content,
    type,
    created_at,
    author_name,
    author_avatar,
    fandom_name,
    tags: tags || []
});

module.exports = {
    POST_TYPES,
    createPostEntity
};
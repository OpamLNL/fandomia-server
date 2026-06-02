const POST_TYPES = {
    DISCUSSION: 'discussion',
    QUESTION: 'question',
    NEWS: 'news'
};

const createPostEntity = ({
                              id,
                              user_id,
                              fandom_id,
                              work_id,
                              title,
                              content,
                              type,
                              content_rating,
                              created_at,
                              author_name,
                              author_avatar,
                              fandom_name,
                              tags,
                              linked_work,
                          }) => ({
    id,
    user_id,
    fandom_id,
    work_id: work_id || null,
    title,
    content,
    type,
    content_rating: content_rating || 'general',
    created_at,
    author_name,
    author_avatar,
    fandom_name,
    tags: tags || [],
    linked_work: linked_work || null,
});

module.exports = {
    POST_TYPES,
    createPostEntity
};
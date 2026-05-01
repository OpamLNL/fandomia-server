const WORK_TYPES = {
    FANFIC: 'fanfic',
    ART: 'art',
    THEORY: 'theory',
    REVIEW: 'review',
    COSPLAY: 'cosplay'
};

const createWorkEntity = ({
                              id,
                              user_id,
                              fandom_id,
                              title,
                              description,
                              type,
                              created_at,
                              author_name,
                              author_avatar,
                              fandom_name,
                              images,
                              tags
                          }) => ({
    id,
    user_id,
    fandom_id,
    title,
    description,
    type,
    created_at,
    author_name,
    author_avatar,
    fandom_name,
    images: images || [],
    tags: tags || []
});

module.exports = {
    WORK_TYPES,
    createWorkEntity
};
const createTagEntity = ({
                             id,
                             name,
                             works_count,
                             posts_count,
                             usage_count
                         }) => ({
    id,
    name,
    works_count: works_count || 0,
    posts_count: posts_count || 0,
    usage_count: usage_count || 0
});

module.exports = {
    createTagEntity
};
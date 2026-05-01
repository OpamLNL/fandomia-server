const createFandomEntity = ({
                                id,
                                name,
                                description,
                                cover_image
                            }) => ({
    id,
    name,
    description,
    cover_image
});

module.exports = {
    createFandomEntity
};
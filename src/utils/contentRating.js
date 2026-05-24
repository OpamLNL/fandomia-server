const CONTENT_RATINGS = Object.freeze({
    GENERAL: 'general',
    MATURE: 'mature',
});

function normalizeContentRating(value) {
    return value === CONTENT_RATINGS.MATURE ? CONTENT_RATINGS.MATURE : CONTENT_RATINGS.GENERAL;
}

function matureOnlySql(tableAlias, showMature) {
    if (showMature) return '';
    return ` AND ${tableAlias}.content_rating = 'general'`;
}

function assertCanViewContent(item, { showMature = false, viewerId = null } = {}) {
    if (!item || item.content_rating !== CONTENT_RATINGS.MATURE) return;

    if (showMature) return;

    if (viewerId && Number(item.user_id) === Number(viewerId)) return;

    const error = new Error('Контент 18+. Увімкни перегляд mature-контенту в кабінеті.');
    error.code = 'MATURE_CONTENT';
    error.status = 403;
    throw error;
}

function getViewerContext(req) {
    const viewer = req.viewer;
    return {
        showMature: Boolean(viewer?.show_mature_content),
        viewerId: viewer?.id ?? null,
    };
}

module.exports = {
    CONTENT_RATINGS,
    normalizeContentRating,
    matureOnlySql,
    assertCanViewContent,
    getViewerContext,
};

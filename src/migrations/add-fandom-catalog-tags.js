const { query } = require('../config/database');

async function tableExists(table) {
    const rows = await query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = ? AND table_name = ?`,
        [process.env.DB_DATABASE, table]
    );
    return rows.length > 0;
}

const DEFAULT_TAGS = [
    { name: 'Аніме', sort_order: 1 },
    { name: 'Манга', sort_order: 2 },
    { name: 'Гра', sort_order: 3 },
    { name: 'Книга', sort_order: 4 },
    { name: 'Фільм', sort_order: 5 },
    { name: 'Серіал', sort_order: 6 },
    { name: 'Комікс', sort_order: 7 },
    { name: 'Всесвіт', sort_order: 8 },
    { name: 'Супергерої', sort_order: 9 },
    { name: 'Фентезі', sort_order: 10 },
    { name: 'Науфіка', sort_order: 11 },
    { name: 'Кіберпанк', sort_order: 12 },
    { name: 'MOBA', sort_order: 13 },
    { name: 'MMORPG', sort_order: 14 },
    { name: 'Пісочниця', sort_order: 15 },
    { name: 'Постапокаліпсис', sort_order: 16 },
    { name: '18+', sort_order: 17 },
    { name: 'Сімейний', sort_order: 18 },
];

/** fandom_id -> tag names */
const DEFAULT_LINKS = {
    1: ['Аніме', 'Манга'],
    2: ['Комікс', 'Всесвіт', 'Супергерої', '18+'],
    3: ['Книга', 'Фільм', 'Фентезі'],
    4: ['Аніме', 'Манга', '18+'],
    5: ['Книга', 'Гра', 'Фентезі', '18+'],
    6: ['Комікс', 'Всесвіт', 'Супергерої'],
    7: ['Фільм', 'Всесвіт', 'Науфіка', 'Фентезі'],
    8: ['Серіал', 'Науфіка', 'Фентезі'],
    9: ['Серіал', 'Книга', 'Фентезі', '18+'],
    10: ['Книга', 'Фільм', 'Фентезі'],
    11: ['Серіал', 'Науфіка', '18+'],
    12: ['Серіал', '18+'],
    13: ['Серіал'],
    14: ['Серіал', 'Фентезі', '18+'],
    15: ['Серіал', 'Постапокаліпсис', '18+'],
    16: ['Гра', 'Кіберпанк', '18+', 'Науфіка'],
    17: ['Гра', 'Постапокаліпсис', '18+'],
    18: ['Гра', 'Фентезі', 'Аніме'],
    19: ['Гра', 'MOBA', 'Всесвіт', 'Фентезі'],
    20: ['Гра', 'MOBA', 'Фентезі'],
    21: ['Гра', 'Пісочниця', 'Сімейний'],
    22: ['Гра', '18+'],
    23: ['Гра', '18+'],
    24: ['Гра', '18+'],
    25: ['Гра', 'MMORPG', 'Фентезі'],
    26: ['Серіал', 'Аніме', 'Фентезі', 'Сімейний'],
    27: ['Серіал', 'Аніме', '18+'],
    28: ['Серіал', 'Аніме', 'MOBA'],
    29: ['Аніме', 'Манга'],
    30: ['Аніме', 'Манга'],
};

async function seedCatalogTags() {
    const existing = await query(`SELECT COUNT(*) AS count FROM fandom_catalog_tags`);
    if (existing[0].count > 0) return;

    for (const tag of DEFAULT_TAGS) {
        await query(
            `INSERT INTO fandom_catalog_tags (name, sort_order) VALUES (?, ?)`,
            [tag.name, tag.sort_order]
        );
    }

    const tagRows = await query(`SELECT id, name FROM fandom_catalog_tags`);
    const tagByName = Object.fromEntries(tagRows.map((r) => [r.name, r.id]));

    for (const [fandomId, names] of Object.entries(DEFAULT_LINKS)) {
        for (const name of names) {
            const catalogTagId = tagByName[name];
            if (!catalogTagId) continue;
            await query(
                `INSERT IGNORE INTO fandom_catalog_tag_links (fandom_id, catalog_tag_id) VALUES (?, ?)`,
                [Number(fandomId), catalogTagId]
            );
        }
    }

    console.log('✅ Seeded fandom catalog tags');
}

async function ensureFandomCatalogTagsSchema() {
    if (!(await tableExists('fandom_catalog_tags'))) {
        await query(`
            CREATE TABLE fandom_catalog_tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                sort_order INT NOT NULL DEFAULT 0
            )
        `);
        console.log('✅ Created fandom_catalog_tags');
    }

    if (!(await tableExists('fandom_catalog_tag_links'))) {
        await query(`
            CREATE TABLE fandom_catalog_tag_links (
                fandom_id INT NOT NULL,
                catalog_tag_id INT NOT NULL,
                PRIMARY KEY (fandom_id, catalog_tag_id),
                FOREIGN KEY (fandom_id) REFERENCES fandoms(id) ON DELETE CASCADE,
                FOREIGN KEY (catalog_tag_id) REFERENCES fandom_catalog_tags(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created fandom_catalog_tag_links');
    }

    await seedCatalogTags();
}

module.exports = { ensureFandomCatalogTagsSchema };

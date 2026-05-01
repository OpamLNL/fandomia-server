const fs = require('fs');
const path = require('path');
const axios = require('axios');

const equipmentPath = path.join(__dirname, '..', 'src', 'data', 'photos', 'equipment.json');
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'equipment');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

async function downloadImage(url, filename) {
    const filePath = path.join(imagesDir, filename);
    if (fs.existsSync(filePath)) {
        console.log(`🟡 Пропущено (існує): ${filename}`);
        return;
    }

    try {
        const response = await axios.get(url, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log(`✅ Завантажено: ${filename}`);
    } catch (err) {
        console.warn(`❌ Помилка: ${url} — ${err.message}`);
    }
}

async function run() {
    const raw = fs.readFileSync(equipmentPath, 'utf-8');
    const equipment = JSON.parse(raw);

    for (const item of equipment) {
        const filename = path.basename(item.thumbUrl);
        await downloadImage(item.originalUrl, filename);
    }

    console.log('📥 Усі зображення опрацьовано.');
}

run();

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

let credential;

if (process.env.GOOGLE_CREDENTIALS) {
    const raw = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    raw.private_key = raw.private_key.replace(/\\n/g, '\n');
    credential = admin.credential.cert(raw);
} else {
    const keyPath = path.resolve(
        __dirname,
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './secrets/fandomia-web-service-account.json'
    );

    if (!fs.existsSync(keyPath)) {
        throw new Error(
            `Firebase service account не знайдено: ${keyPath}\n` +
            'Завантаж ключ: Firebase Console → Fandomia Web → ⚙️ Project settings → Service accounts → Generate new private key\n' +
            'Збережи файл як fandomia-server/secrets/fandomia-web-service-account.json'
        );
    }

    const serviceAccount = require(keyPath);
    credential = admin.credential.cert(serviceAccount);
}

admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || 'fandomia-web',
});

module.exports = admin;

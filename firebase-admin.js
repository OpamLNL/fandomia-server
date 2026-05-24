const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DEFAULT_WEB_KEY = './secrets/fandomia-web-service-account.json';
const DEFAULT_AUTH_KEY = './secrets/fandomia-auth-firebase-adminsdk-fbsvc-a4afaa77e2.json';

let credential;
let serviceAccountProjectId;

if (process.env.GOOGLE_CREDENTIALS) {
    const raw = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    raw.private_key = raw.private_key.replace(/\\n/g, '\n');
    serviceAccountProjectId = raw.project_id;
    credential = admin.credential.cert(raw);
} else {
    let keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!keyPath) {
        const webPath = path.resolve(__dirname, DEFAULT_WEB_KEY);
        const authPath = path.resolve(__dirname, DEFAULT_AUTH_KEY);
        keyPath = fs.existsSync(webPath) ? webPath : authPath;
    } else {
        keyPath = path.resolve(__dirname, keyPath);
    }

    if (!fs.existsSync(keyPath)) {
        throw new Error(
            `Firebase service account не знайдено: ${keyPath}\n` +
            'Завантаж ключ: Firebase Console → fandomia-web → ⚙️ Project settings → Service accounts → Generate new private key\n' +
            `Збережи файл як fandomia-server/${DEFAULT_WEB_KEY}`
        );
    }

    const serviceAccount = require(keyPath);
    serviceAccountProjectId = serviceAccount.project_id;
    credential = admin.credential.cert(serviceAccount);
}

const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccountProjectId || 'fandomia-web';

admin.initializeApp({
    credential,
    projectId,
});

module.exports = admin;

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const DEFAULT_WEB_KEY = './secrets/fandomia-web-service-account.json';

function normalizePrivateKey(value) {
    if (!value) return value;
    return value.replace(/\\n/g, '\n');
}

function credentialFromSplitEnv() {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY?.trim());

    if (!clientEmail || !privateKey) {
        return null;
    }

    const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID?.trim(),
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID?.trim() || undefined,
        private_key: privateKey,
        client_email: clientEmail,
        client_id: process.env.FIREBASE_CLIENT_ID?.trim() || undefined,
        auth_uri: process.env.FIREBASE_AUTH_URI?.trim() || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI?.trim() || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
            process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL?.trim()
            || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL?.trim() || undefined,
    };

    Object.keys(serviceAccount).forEach((key) => {
        if (serviceAccount[key] === undefined) delete serviceAccount[key];
    });

    return {
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
    };
}

function credentialFromJsonEnv() {
    if (!process.env.GOOGLE_CREDENTIALS) {
        return null;
    }

    const raw = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    raw.private_key = normalizePrivateKey(raw.private_key);

    return {
        credential: admin.credential.cert(raw),
        projectId: raw.project_id,
    };
}

function credentialFromFile() {
    let keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!keyPath) {
        keyPath = path.resolve(__dirname, DEFAULT_WEB_KEY);
    } else {
        keyPath = path.resolve(__dirname, keyPath);
    }

    if (!fs.existsSync(keyPath)) {
        return null;
    }

    const serviceAccount = require(keyPath);
    return {
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
    };
}

function resolveFirebaseCredential() {
    const fromSplit = credentialFromSplitEnv();
    if (fromSplit) return fromSplit;

    const fromJson = credentialFromJsonEnv();
    if (fromJson) return fromJson;

    const fromFile = credentialFromFile();
    if (fromFile) return fromFile;

    throw new Error(
        'Firebase Admin не налаштовано. На Vercel задай окремі змінні:\n'
        + 'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY\n'
        + 'Локально можна FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/....json'
    );
}

if (!admin.apps.length) {
    const { credential, projectId } = resolveFirebaseCredential();
    admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID || projectId || 'fandomia-web',
    });
}

module.exports = admin;

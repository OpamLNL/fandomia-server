const admin = require('firebase-admin');
require('dotenv').config();

let credential;

if (process.env.GOOGLE_CREDENTIALS) {
    const raw = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    raw.private_key = raw.private_key.replace(/\\n/g, '\n');
    credential = admin.credential.cert(raw);
} else {
    const serviceAccount = require('./secrets/fandomia-auth-firebase-adminsdk-fbsvc-a4afaa77e2.json');
    credential = admin.credential.cert(serviceAccount);
}

admin.initializeApp({
    credential
});

module.exports = admin;
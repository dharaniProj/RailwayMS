const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Firebase is still used for Auth if needed, but Storage is now handled by Cloudinary.
// We initialize without storageBucket to avoid startup errors when FIREBASE_STORAGE_BUCKET is unset.

let bucket = null;

if (fs.existsSync(serviceAccountPath)) {
    console.log('Initializing Firebase with serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // storageBucket intentionally omitted — storage is now Cloudinary
        });
        // bucket is not used; kept as null to avoid breaking any legacy references
    } catch (err) {
        if (err.code !== 'app/duplicate-app') {
            console.error('Firebase init error:', err.message);
        }
    }
} else {
    console.warn('Firebase serviceAccountKey.json not found — Firebase features disabled.');
}

module.exports = { admin, bucket };

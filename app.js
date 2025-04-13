require('dotenv').config(); // Load env variables
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// --- Cloudinary Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Multer Storage with Cloudinary ---
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'photo-gallery',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
        transformation: [{ width: 1200, crop: 'limit' }]
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- Middleware ---
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

function checkLogin(req, res, next) {
    if (!req.session.loggedIn) return res.redirect('/login');
    next();
}

// --- Authentication Routes ---
app.get('/login', (req, res) => {
    const error = req.session.loginError;
    req.session.loginError = null;
    res.render('login', { error });
});

app.post('/login', (req, res) => {
    const correctPassword = process.env.LOGIN_PASSWORD || 'Amielperd55';
    if (req.body.password === correctPassword) {
        req.session.loggedIn = true;
        return res.redirect('/gallery');
    }
    req.session.loginError = 'Incorrect password. Please try again.';
    return res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send('Error logging out');
        res.redirect('/login');
    });
});

// --- Gallery Route ---
const itemsPerPage = 20;

app.get('/gallery', checkLogin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;

    try {
        const result = await cloudinary.search
            .expression('folder:photo-gallery')
            .sort_by('public_id', 'desc')
            .max_results(500)
            .execute();

        const images = result.resources.map(img => ({
            url: img.secure_url,
            public_id: img.public_id
        }));

        const totalPages = Math.ceil(images.length / itemsPerPage);
        const imagesOnPage = images.slice((page - 1) * itemsPerPage, page * itemsPerPage);

        res.render('gallery', {
            images: imagesOnPage,
            photoCount: images.length,
            totalPages,
            currentPage: page,
            loggedIn: req.session.loggedIn
        });
    } catch (err) {
        console.error('Cloudinary error:', err);
        res.status(500).send('Error retrieving images from Cloudinary');
    }
});

// --- Upload Route ---
app.post('/upload', checkLogin, upload.single('photo'), (req, res) => {
    if (req.file) {
        console.log(`✅ Uploaded to Cloudinary: ${req.file.path}`);
        res.redirect('/gallery');
    } else {
        res.send('❌ No file uploaded!');
    }
});

// --- Delete Route (supports slashes in public_id) ---
app.post('/delete/*', checkLogin, async (req, res) => {
    const public_id = req.params[0]; // This captures the full path including slashes

    try {
        await cloudinary.uploader.destroy(public_id);
        console.log(`🗑️ Deleted from Cloudinary: ${public_id}`);
        res.redirect('/gallery');
    } catch (err) {
        console.error('❌ Failed to delete from Cloudinary:', err);
        res.status(500).send('Failed to delete image');
    }
});

// --- Redirect Root to Gallery ---
app.get('/', checkLogin, (req, res) => res.redirect('/gallery'));

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

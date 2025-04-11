const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// --- Configuration ---
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session setup
app.use(session({
    secret: 'Amielperd55',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// --- File Upload Setup ---
const uploadFolder = 'uploads/';
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadFolder),
    filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_, file, cb) => {
        const validTypes = /jpeg|jpg|png|gif|bmp/;
        const isValid = validTypes.test(file.mimetype) && validTypes.test(path.extname(file.originalname).toLowerCase());
        cb(isValid ? null : new Error('Only image files are allowed'), isValid);
    }
});

// --- Middleware ---
function checkLogin(req, res, next) {
    if (!req.session.loggedIn) return res.redirect('/login');
    next();
}

// --- Routes ---
app.get('/login', (req, res) => {
    const error = req.session.loginError;
    req.session.loginError = null; // Clear the error after displaying it
    res.render('login', { error });
});

app.post('/login', (req, res) => {
    const correctPassword = 'Amielperd55';
    if (req.body.password === correctPassword) {
        req.session.loggedIn = true;
        return res.redirect('/gallery');
    } else {
        req.session.loginError = 'Incorrect password. Please try again.';
        return res.redirect('/login'); // Redirect instead of rendering directly
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send('Error logging out');
        res.redirect('/login');
    });
});

const itemsPerPage = 20; // Number of images to display per page

app.get('/gallery', checkLogin, (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page param
    fs.readdir(uploadFolder, (err, files) => {
        if (err) {
            console.error('Error reading upload folder:', err);
            return res.status(500).send('Error reading upload folder');
        }

        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file));

        // Pagination logic
        const totalPages = Math.ceil(imageFiles.length / itemsPerPage);
        const imagesOnPage = imageFiles.slice((page - 1) * itemsPerPage, page * itemsPerPage);

        res.render('gallery', {
            images: imagesOnPage,
            photoCount: imageFiles.length,
            totalPages: totalPages,
            currentPage: page,
            loggedIn: req.session.loggedIn
        });
    });
});

app.get('/', checkLogin, (req, res) => res.redirect('/gallery'));

app.get('/gallery', checkLogin, (req, res) => {
    fs.readdir(uploadFolder, (err, files) => {
        if (err) {
            console.error('Error reading upload folder:', err);
            return res.status(500).send('Error reading upload folder');
        }

        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file));
        res.render('gallery', {
            images: imageFiles,
            photoCount: imageFiles.length,
            loggedIn: req.session.loggedIn
        });
    });
});

app.post('/upload', checkLogin, upload.single('photo'), (req, res) => {
    if (req.file) {
        console.log(`File uploaded: ${req.file.filename}`);
        res.render('uploadSuccess', { message: 'File uploaded successfully!' });
    } else {
        res.send('No file uploaded!');
    }
});

app.post('/delete/:image', checkLogin, (req, res) => {
    const imagePath = path.join(__dirname, uploadFolder, req.params.image);
    fs.unlink(imagePath, err => {
        if (err) {
            console.error('Error deleting the image:', err);
            return res.status(500).send('Failed to delete the image');
        }
        console.log(`Image ${req.params.image} deleted successfully`);
        res.redirect('/gallery');
    });
});

// --- Start Server ---
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

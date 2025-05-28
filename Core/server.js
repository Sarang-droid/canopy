const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});

app.get('/index.html', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.post('/login', (req, res) => {
    // In a real application, you would verify credentials here
    req.session.authenticated = true;
    req.session.user = req.body;
    res.json({ success: true });
});

app.post('/register', (req, res) => {
    // In a real application, you would save user data here
    req.session.authenticated = true;
    req.session.user = req.body;
    res.json({ success: true });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { registerValidator, loginValidator } = require('../validator/authvalidator');

// Registration route
router.post('/register', registerValidator, authController.register);

// Login route
router.post('/login', loginValidator, authController.login);

module.exports = router;
const express = require('express');
const router = express.Router();
const branchAuthController = require('../controller/branchAuthController');
const { body } = require('express-validator');

// Validate user credentials for Canopy branch access
router.post('/branch-login', [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('password').notEmpty().withMessage('Password is required')
], branchAuthController.validateBranchAccess);

module.exports = router;
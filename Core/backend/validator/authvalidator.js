const Joi = require('joi');

// Registration validation schema
const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } })
        .required(),
    department: Joi.string()
        .valid('Technical', 'Financial', 'Project', 'Legal', 'Compliance', 'Marketing', 'Canopy')
        .required(),
    role: Joi.string()
        .valid('employee', 'admin')
        .required()
});

// Login validation schema
const loginSchema = Joi.object({
    userId: Joi.string()
        .required(),
    password: Joi.string()
        .min(6)
        .required()
});

// Registration validator middleware
const registerValidator = async (req, res, next) => {
    try {
        await registerSchema.validateAsync(req.body);
        next();
    } catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.details[0].message
        });
    }
};

// Login validator middleware
const loginValidator = async (req, res, next) => {
    try {
        await loginSchema.validateAsync(req.body);
        next();
    } catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.details[0].message
        });
    }
};

module.exports = {
    registerValidator,
    loginValidator
};
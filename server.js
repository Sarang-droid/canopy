const express = require('express');
const cors = require('cors');
const config = require('./config');
const connectCanopyDB = require('./shared/db/connectCanopy');
const errorHandler = require('./shared/middleware/errorHandler');
const requestLogger = require('./shared/middleware/requestLogger');

// Core routes
const coreRoutes = require('./Core/backend/routes/indexRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Try to connect to database but don't fail if it's not available
connectCanopyDB().catch(error => {
    console.error('Database connection failed:', error);
    console.log('Server will continue running without database connection');
});

// Mount routes
app.use('/api/core', coreRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.environment}`);
});

// Export app for testing
module.exports = app;
const requestLogger = (req, res, next) => {
    const { method, url, originalUrl, query, body } = req;
    const timestamp = new Date().toISOString();
    
    console.log({
        timestamp,
        method,
        url: originalUrl || url,
        query,
        body: method === 'GET' ? undefined : body
    });
    
    next();
};

module.exports = requestLogger;

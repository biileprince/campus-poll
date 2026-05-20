/**
 * Global error handling middleware
 * Catches all unhandled errors and returns a consistent JSON response.
 */
export const errorHandler = (err, req, res, next) => {
    // Log the full error in development, summary in production
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', err);
    } else {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} — ${err.message}`);
    }

    // Prisma unique constraint violation
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return res.status(409).json({
            success: false,
            error: `A record with this ${field} already exists`,
        });
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: 'The requested record was not found',
        });
    }

    // Prisma foreign key violation
    if (err.code === 'P2003') {
        return res.status(400).json({
            success: false,
            error: 'This action references a record that does not exist',
        });
    }

    // Prisma invalid data
    if (err.code === 'P2000') {
        return res.status(400).json({
            success: false,
            error: 'The provided data is too long for this field',
        });
    }

    // JSON parse errors
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body',
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid authentication token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Authentication token has expired. Please sign in again.',
        });
    }

    // Validation errors (express-validator)
    if (err.name === 'ValidationError' || err.errors) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors || err.message,
        });
    }

    // Payload too large
    if (err.status === 413 || err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            error: 'Request body is too large',
        });
    }

    // Default error
    const statusCode = err.statusCode || err.status || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Something went wrong. Please try again later.'
        : err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes.
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
    });
};

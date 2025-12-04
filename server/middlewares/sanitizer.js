import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Sanitize user input to prevent NoSQL injection attacks
 * Removes any keys that start with $ or contain .
 */
export const sanitizeData = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`⚠️  Sanitized potentially malicious data: ${key}`);
    },
});

/**
 * Prevent HTTP Parameter Pollution attacks
 * Protects against duplicate parameters in query strings
 */
export const preventParameterPollution = hpp({
    whitelist: ['options'], // Allow array of options in poll creation
});

/**
 * Custom XSS sanitization middleware
 * Since xss-clean is deprecated, we'll implement basic XSS protection
 */
export const sanitizeXSS = (req, res, next) => {
    // Helper function to sanitize strings
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;

        // Remove script tags and common XSS patterns
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<iframe/gi, '')
            .replace(/<object/gi, '')
            .replace(/<embed/gi, '');
    };

    // Recursively sanitize object
    const sanitizeObject = (obj) => {
        if (obj === null || obj === undefined) return obj;

        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }

        if (typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitizeObject(obj[key]);
                }
            }
            return sanitized;
        }

        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }

        return obj;
    };

    // Sanitize request body, query, and params
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

/**
 * Content Security Policy headers
 * Helps prevent XSS attacks by restricting resource loading
 */
export const setSecurityHeaders = (req, res, next) => {
    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter in older browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Strict Transport Security (force HTTPS in production)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
};

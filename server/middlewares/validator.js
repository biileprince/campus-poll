import { body, param, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

/**
 * Validation rules for creating a poll
 */
export const validateCreatePoll = [
    body('question')
        .trim()
        .notEmpty()
        .withMessage('Question is required')
        .isLength({ min: 5, max: 500 })
        .withMessage('Question must be between 5 and 500 characters')
        .matches(/^[a-zA-Z0-9\s.,!?'-]+$/)
        .withMessage('Question contains invalid characters'),

    body('options')
        .isArray({ min: 2, max: 10 })
        .withMessage('Must provide between 2 and 10 options'),

    body('options.*')
        .trim()
        .notEmpty()
        .withMessage('Option cannot be empty')
        .isLength({ min: 1, max: 200 })
        .withMessage('Each option must be between 1 and 200 characters')
        .matches(/^[a-zA-Z0-9\s.,!?'-]+$/)
        .withMessage('Option contains invalid characters'),

    handleValidationErrors,
];

/**
 * Validation rules for getting poll by voteId
 */
export const validateGetPoll = [
    param('voteId')
        .trim()
        .notEmpty()
        .withMessage('Vote ID is required')
        .isLength({ min: 20, max: 30 })
        .withMessage('Invalid vote ID format')
        .matches(/^[a-z0-9]+$/)
        .withMessage('Vote ID contains invalid characters'),

    handleValidationErrors,
];

/**
 * Validation rules for submitting a vote
 */
export const validateSubmitVote = [
    param('voteId')
        .trim()
        .notEmpty()
        .withMessage('Vote ID is required')
        .isLength({ min: 20, max: 30 })
        .withMessage('Invalid vote ID format')
        .matches(/^[a-z0-9]+$/)
        .withMessage('Vote ID contains invalid characters'),

    body('optionId')
        .trim()
        .notEmpty()
        .withMessage('Option ID is required')
        .isInt({ min: 1 })
        .withMessage('Option ID must be a positive integer'),

    handleValidationErrors,
];

/**
 * Validation rules for getting poll results
 */
export const validateGetResults = [
    param('resultsId')
        .trim()
        .notEmpty()
        .withMessage('Results ID is required')
        .isLength({ min: 20, max: 30 })
        .withMessage('Invalid results ID format')
        .matches(/^[a-z0-9]+$/)
        .withMessage('Results ID contains invalid characters'),

    handleValidationErrors,
];

/**
 * Validation rules for casting a vote (legacy endpoint)
 */
export const validateCastVote = [
    param('optionId')
        .trim()
        .notEmpty()
        .withMessage('Option ID is required')
        .matches(/^[a-z0-9]+$/)
        .withMessage('Option ID contains invalid characters'),

    body('voteId')
        .trim()
        .notEmpty()
        .withMessage('Vote ID is required')
        .isLength({ min: 20, max: 30 })
        .withMessage('Invalid vote ID format')
        .matches(/^[a-z0-9]+$/)
        .withMessage('Vote ID contains invalid characters'),

    handleValidationErrors,
];

/**
 * Validation rules for updating a poll
 */
export const validateUpdatePoll = [
    param('resultsId')
        .trim()
        .notEmpty()
        .withMessage('Results ID is required')
        .isLength({ min: 20, max: 30 })
        .withMessage('Invalid results ID format')
        .matches(/^[a-z0-9]+$/)
        .withMessage('Results ID contains invalid characters'),

    body('question')
        .optional()
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Question must be between 5 and 500 characters')
        .matches(/^[a-zA-Z0-9\s.,!?'-]+$/)
        .withMessage('Question contains invalid characters'),

    body('options')
        .optional()
        .isArray({ min: 2, max: 10 })
        .withMessage('Must provide between 2 and 10 options'),

    body('options.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Option cannot be empty')
        .isLength({ min: 1, max: 200 })
        .withMessage('Each option must be between 1 and 200 characters')
        .matches(/^[a-zA-Z0-9\s.,!?'-]+$/)
        .withMessage('Option contains invalid characters'),

    handleValidationErrors,
];

/**
 * Validation rules for deleting a poll
 */
export const validateDeletePoll = [
    param('resultsId')
        .trim()
        .notEmpty()
        .withMessage('Results ID is required')
        .isLength({ min: 20, max: 30 })
        .withMessage('Invalid results ID format')
        .matches(/^[a-z0-9]+$/)
        .withMessage('Results ID contains invalid characters'),

    handleValidationErrors,
];

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMaharashtra = exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.reduce((acc, detail) => {
                acc[detail.path.join('.')] = detail.message;
                return acc;
            }, {});
            res.status(400).json({
                message: 'Validation error',
                errors,
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
// Maharashtra validation
const validateMaharashtra = (req, res, next) => {
    const state = req.body.state || req.body.shippingAddress?.state;
    if (state && state.toLowerCase() !== 'maharashtra') {
        res.status(403).json({
            message: 'This service is currently available only in Maharashtra.',
        });
        return;
    }
    next();
};
exports.validateMaharashtra = validateMaharashtra;

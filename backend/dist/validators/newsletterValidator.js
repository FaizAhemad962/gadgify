"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNewsletterUnsubscribe = exports.validateNewsletterSubscribe = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Joi schema validators for newsletter endpoints
 */
exports.validateNewsletterSubscribe = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
}).required();
exports.validateNewsletterUnsubscribe = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
}).required();

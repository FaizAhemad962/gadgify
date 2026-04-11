import Joi from "joi";

/**
 * Joi schema validators for newsletter endpoints
 */

export const validateNewsletterSubscribe = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
}).required();

export const validateNewsletterUnsubscribe = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
}).required();

const Joi = require("joi");

//register joi schema
exports.registerSchema = Joi.object({
  user_name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters long",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required",
  }),
});

// Login schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});
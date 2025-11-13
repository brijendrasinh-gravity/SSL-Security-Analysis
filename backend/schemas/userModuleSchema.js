const Joi = require("joi");


exports.createUserSchema = Joi.object({
  user_name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "User name is required",
    "string.min": "User name must be at least 3 characters long",
    "string.max": "User name cannot exceed 50 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, and one number",
    }),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be exactly 10 digits",
    }),

  role_id: Joi.number().integer().required().messages({
    "number.base": "Role ID must be a valid number",
    "any.required": "Role ID is required",
  }),

  status: Joi.boolean().default(true).messages({
    "boolean.base": "Status must be either true or false",
  }),
});

exports.getUserByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.deleeUserByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.updateUserSchema = Joi.object({
  user_name: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),
  role_id: Joi.number().integer().optional(),
  status: Joi.boolean().optional(),
});

exports.toggleStatusSchema = Joi.object({
  status: Joi.boolean().required(),
});

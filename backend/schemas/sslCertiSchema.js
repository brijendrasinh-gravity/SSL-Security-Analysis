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

//Update Password
exports.changePasswordSchema = Joi.object({
  oldpassword: Joi.string().required().messages({
    "string.empty": "Old password is required",
  }),

  newpassword: Joi.string()
    .disallow(Joi.ref("oldpassword"))
    .min(6)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/)
    .required()
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, and one number",
      "any.invalid": "New password cannot be the same as old password",
    }),
});

exports.getReportByidSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.deleteReportByid = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.updateProfileSchema = Joi.object({
  user_name: Joi.string().min(3).max(50).required(),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),
  description: Joi.string().allow(null, "").max(255),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),
});

exports.forgotResetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  newpassword: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must include uppercase, lowercase, and number",
    }),
});

exports.firstTimeLoginCheckSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
  }),
});

exports.setNewPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  newPassword: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/)
    .required()
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
      "string.pattern.base":
        "Password must include uppercase, lowercase and a number",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords must match",
      "string.empty": "Confirm password is required",
    }),
});
const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'any.required': 'username is required',
    'string.base': 'username must be a string',
    'string.empty': 'username is required',
    'string.min': 'username must be between 3 and 30 characters',
    'string.max': 'username must be between 3 and 30 characters',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.base': 'email must be a string',
    'string.empty': 'email is required',
    'string.email': 'email must be a valid email format',
  }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .required()
    .messages({
      'any.required': 'password is required',
      'string.base': 'password must be a string',
      'string.empty': 'password is required',
      'string.pattern.base': 'password must contain at least one letter and one number',
    }),
  age: Joi.number().strict().min(18).required().messages({
    'any.required': 'age is required',
    'number.base': 'age must be a number type',
    'number.min': 'age must be at least 18',
  }),
  role: Joi.string().valid('user', 'admin').required().messages({
    'any.required': 'role is required',
    'string.base': 'role must be a string',
    'any.only': 'role must be either "user" or "admin"',
    'string.empty': 'role is required',
  }),
  website: Joi.string().uri().optional().messages({
    'string.base': 'website must be a valid URL string',
    'string.uri': 'website must be a valid URL string',
  }),
});

function validateUser(req, res, next) {
  const sanitizedBody = { ...req.body };

  if (typeof sanitizedBody.username === 'string') {
    sanitizedBody.username = sanitizedBody.username.trim();
  }

  if (typeof sanitizedBody.email === 'string') {
    sanitizedBody.email = sanitizedBody.email.trim().toLowerCase();
  }

  const { error, value } = userSchema.validate(sanitizedBody, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const errors = [...new Set(error.details.map((detail) => detail.message))];
    return res.status(400).json(errors);
  }

  req.body = value;
  next();
}

module.exports = validateUser;

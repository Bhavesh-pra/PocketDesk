const errorResponse = (res, status, message, details = null) => {
  const response = { error: message };
  if (details) response.details = details;
  return res.status(status).json(response);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpper && hasLower && hasNumber;
};

const validateSignup = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  else if (!isValidEmail(email)) errors.push("Invalid email format");

  if (!password) errors.push("Password is required");
  else if (!isStrongPassword(password)) {
    errors.push("Password must be at least 8 characters with uppercase, lowercase, and number");
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, "Validation failed", errors);
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    return errorResponse(res, 400, "Validation failed", errors);
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

const validateChat = (req, res, next) => {
  const { question } = req.body;
  const errors = [];

  if (!question) errors.push("Question is required");
  else if (typeof question !== "string") errors.push("Question must be a string");
  else if (question.trim().length === 0) errors.push("Question cannot be empty");
  else if (question.length > 10000) errors.push("Question is too long");

  if (errors.length > 0) {
    return errorResponse(res, 400, "Validation failed", errors);
  }

  req.body.question = question.trim();
  next();
};

const validateTodo = (req, res, next) => {
  const text = req.body.title || req.body.text;
  const errors = [];

  if (!text) errors.push("Title or text is required");
  else if (typeof text !== "string") errors.push("Todo content must be a string");
  else if (text.trim().length === 0) errors.push("Todo content cannot be empty");
  else if (text.length > 500) errors.push("Todo content is too long");

  if (errors.length > 0) {
    return errorResponse(res, 400, "Validation failed", errors);
  }

  req.body.text = text.trim();
  next();
};

const validateContact = (req, res, next) => {
  const { name, email, message } = req.body;
  const errors = [];

  if (!name) errors.push("Name is required");
  else if (name.trim().length < 2) errors.push("Name is too short");

  if (!email) errors.push("Email is required");
  else if (!isValidEmail(email)) errors.push("Invalid email format");

  if (!message) errors.push("Message is required");
  else if (message.trim().length < 10) errors.push("Message is too short");
  else if (message.length > 5000) errors.push("Message is too long");

  if (errors.length > 0) {
    return errorResponse(res, 400, "Validation failed", errors);
  }

  req.body.email = email.toLowerCase().trim();
  req.body.name = name.trim();
  req.body.message = message.trim();
  next();
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const mongoose = require("mongoose");
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid ID format");
    }
    next();
  };
};

module.exports = {
  validateSignup,
  validateLogin,
  validateChat,
  validateTodo,
  validateContact,
  validateObjectId,
  errorResponse,
  isValidEmail,
  isStrongPassword
};

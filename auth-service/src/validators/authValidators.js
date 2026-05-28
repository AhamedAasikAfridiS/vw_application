const { body } = require("express-validator");
const { USER_ROLES } = require("../models/userModel");

const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name must be 2-120 characters."),
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters."),
  body("role")
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage("Role must be user or admin.")
];

const loginValidator = [
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
  body("password").isString().notEmpty().withMessage("Password is required.")
];

const refreshValidator = [
  body("refreshToken").isString().notEmpty().withMessage("Refresh token is required.")
];

const logoutValidator = [
  body("refreshToken").optional().isString().withMessage("Refresh token must be a string.")
];

module.exports = { registerValidator, loginValidator, refreshValidator, logoutValidator };

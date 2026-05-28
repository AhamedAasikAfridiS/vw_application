const { body, param } = require("express-validator");

const profileValidator = [
  body("displayName").trim().isLength({ min: 2, max: 120 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("phone").optional({ nullable: true }).trim().isLength({ max: 40 }),
  body("location").optional({ nullable: true }).trim().isLength({ max: 120 }),
  body("avatarUrl").optional({ nullable: true }).isURL({ require_protocol: true })
];

const saveVehicleValidator = [
  body("vehicleId").isUUID().withMessage("Vehicle id must be a valid UUID."),
  body("notes").optional({ nullable: true }).trim().isLength({ max: 500 })
];

const vehicleIdParamValidator = [
  param("vehicleId").isUUID().withMessage("Vehicle id must be a valid UUID.")
];

const preferencesValidator = [
  body("budgetMin").optional({ nullable: true }).isFloat({ min: 0 }),
  body("budgetMax").optional({ nullable: true }).isFloat({ min: 0 }),
  body("favoriteCategory").optional({ nullable: true }).trim().isLength({ max: 80 }),
  body("preferredDrivetrain").optional({ nullable: true }).trim().isLength({ max: 80 }),
  body("colorTheme").optional().isIn(["black-yellow-red", "black-white", "redline"]),
  body("newsletterOptIn").optional().isBoolean()
];

module.exports = {
  profileValidator,
  saveVehicleValidator,
  vehicleIdParamValidator,
  preferencesValidator
};

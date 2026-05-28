const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  registerValidator,
  loginValidator,
  refreshValidator,
  logoutValidator
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, authController.register);
router.post("/login", loginValidator, validateRequest, authController.login);
router.post("/refresh", refreshValidator, validateRequest, authController.refresh);
router.post("/logout", logoutValidator, validateRequest, authController.logout);
router.get("/me", authenticate, authController.me);

module.exports = router;

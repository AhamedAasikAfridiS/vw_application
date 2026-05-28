const express = require("express");
const profileController = require("../controllers/profileController");
const { authenticate } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  profileValidator,
  saveVehicleValidator,
  vehicleIdParamValidator,
  preferencesValidator
} = require("../validators/profileValidators");

const router = express.Router();

router.use(authenticate);

router.get("/me", profileController.getProfile);
router.put("/me", profileValidator, validateRequest, profileController.updateProfile);
router.get("/saved-vehicles", profileController.listSavedVehicles);
router.post("/saved-vehicles", saveVehicleValidator, validateRequest, profileController.saveVehicle);
router.delete(
  "/saved-vehicles/:vehicleId",
  vehicleIdParamValidator,
  validateRequest,
  profileController.removeSavedVehicle
);
router.get("/preferences", profileController.getPreferences);
router.put("/preferences", preferencesValidator, validateRequest, profileController.updatePreferences);

module.exports = router;

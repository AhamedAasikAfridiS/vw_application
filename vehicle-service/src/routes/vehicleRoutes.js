const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  listVehicleValidator,
  idValidator,
  vehiclePayloadValidator
} = require("../validators/vehicleValidators");

const router = express.Router();

router.get("/", listVehicleValidator, validateRequest, vehicleController.listVehicles);
router.get("/categories", vehicleController.getCategories);
router.get("/:id", idValidator, validateRequest, vehicleController.getVehicle);
router.post("/", authenticate, requireRole("admin"), vehiclePayloadValidator, validateRequest, vehicleController.createVehicle);
router.put("/:id", authenticate, requireRole("admin"), idValidator, vehiclePayloadValidator, validateRequest, vehicleController.updateVehicle);
router.delete("/:id", authenticate, requireRole("admin"), idValidator, validateRequest, vehicleController.deleteVehicle);

module.exports = router;

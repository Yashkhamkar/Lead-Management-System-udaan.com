const router = require("express").Router();
const {
  calculateOverallPerformance,
  getOrderingPatternsAndFrequency,
} = require("../controllers/performance.controller");
const protect = require("../middleware/authMiddleware");

router.get("/:lead_id", protect, calculateOverallPerformance);
router.get("/ordersAndFrequency/:lead_id", protect, getOrderingPatternsAndFrequency);

module.exports = router;

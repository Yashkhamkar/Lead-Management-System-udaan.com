const router = require("express").Router();

const { loginKAM, addKAM } = require("../controllers/kam.controller");

router.route("/").post(addKAM);
router.route("/login").post(loginKAM);

module.exports = router;
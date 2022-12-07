//third-party packages
const express = require("express");

//Custom references
const apiInfoController = require("../controllers/api-info");

const router = express.Router();

router.get("/", apiInfoController.getIndex);
router.get("/api-info-lotes", apiInfoController.getLotMethodExplanation);

module.exports = router;

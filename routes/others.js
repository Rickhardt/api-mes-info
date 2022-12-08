//third-party packages
const express = require("express");

//Custom references
const apiInfoController = require("../controllers/api-info");
const othersController = require("../controllers/others");

const router = express.Router();

router.get("/", apiInfoController.getIndex);
router.get("/api-info-lotes", apiInfoController.getLotMethodExplanation);
router.get("/api-info-misc", apiInfoController.getMiscMethodExplanation);
router.get("/rejectcode/:stepName", othersController.getRejectCodes);

module.exports = router;

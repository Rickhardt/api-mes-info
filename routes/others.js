//third-party packages
const express = require("express");
const { body } = require("express-validator");

//Custom references
const apiInfoController = require("../controllers/api-info");
const othersController = require("../controllers/others");

const router = express.Router();

let contadorMalas;
let contador;
const locatorKeys = ["LOCATOR", "BUFFER"];
const updateLocatorKeys = ["LOCATOR", "BATCH", "OCCUPIED", "CAPACITY"];
const userKeys = ["USER"];

router.get("/", apiInfoController.getIndex);
router.get("/api-info-lotes", apiInfoController.getLotMethodExplanation);
router.get("/api-info-misc", apiInfoController.getMiscMethodExplanation);
router.get("/rejectcode/:stepName", othersController.getRejectCodes);
router.get(
  "/availablelocators/:bufferName",
  othersController.getAvailableLocators
);

/************************************************************/

router.post(
  "/createlocator",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;
        contador = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            (!Object.keys(req.body[element]).every((key) => {
              return locatorKeys.includes(key);
            }) &&
              !Object.keys(req.body[element]).every((key) => {
                return userKeys.includes(key);
              })) ||
            (Object.keys(req.body[element]).every((key) => {
              return locatorKeys.includes(key);
            }) &&
              Object.keys(req.body[element]).every((key) => {
                return userKeys.includes(key);
              }))
          ) {
            contadorMalas++;
          }

          contador++;
        });

        if (contadorMalas > 0) {
          return false;
        } else {
          return true;
        }
      })
      .withMessage(
        "Se ha omitido, o se ha agregado de más, un parámetro en el cuerpo de la petición"
      ),
  ],
  othersController.postNewLocators
);

/***********************************************************/

router.put(
  "/updatelocator",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;
        contador = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            (!Object.keys(req.body[element]).every((key) => {
              return updateLocatorKeys.includes(key);
            }) &&
              !Object.keys(req.body[element]).every((key) => {
                return userKeys.includes(key);
              })) ||
            (Object.keys(req.body[element]).every((key) => {
              return updateLocatorKeys.includes(key);
            }) &&
              Object.keys(req.body[element]).every((key) => {
                return userKeys.includes(key);
              }))
          ) {
            contadorMalas++;
          }

          contador++;
        });

        if (contadorMalas > 0) {
          return false;
        } else {
          return true;
        }
      })
      .withMessage(
        "Se ha omitido, o se ha agregado de más, un parámetro en el cuerpo de la petición"
      ),
  ],
  othersController.putUpdateLocators
);

module.exports = router;

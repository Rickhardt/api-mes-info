//third-party packages
const express = require("express");
const { body } = require("express-validator");

//Custom references
const batchesController = require("../controllers/batches");

const router = express.Router();

//Cuenta cuantos elementos del JSON tienen pares llave-valor de más (o menos)
//Se usa en las comprobaciones personalizadas.
let contadorMalas = 0;
const batchQueriesKeys = ["BATCH"];
const resultQueryKeys = ["BATCH", "PRUEBA"];

router.get(
  "/batchinfo",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            !Object.keys(req.body[element]).every((key) => {
              return batchQueriesKeys.includes(key);
            })
          ) {
            contadorMalas++;
          }
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
  batchesController.getBatchInfo
);

router.get(
  "/batchattrib",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            !Object.keys(req.body[element]).every((key) => {
              return batchQueriesKeys.includes(key);
            })
          ) {
            contadorMalas++;
          }
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
  batchesController.getBatchAttrib
);

router.get(
  "/batchstep",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            !Object.keys(req.body[element]).every((key) => {
              return batchQueriesKeys.includes(key);
            })
          ) {
            contadorMalas++;
          }
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
  batchesController.getBatchStep
);

router.get(
  "/batchdefects",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            !Object.keys(req.body[element]).every((key) => {
              return batchQueriesKeys.includes(key);
            })
          ) {
            contadorMalas++;
          }
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
  batchesController.getBatchDefects
);

router.get(
  "/batchtestresults",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            !Object.keys(req.body[element]).every((key) => {
              return resultQueryKeys.includes(key);
            })
          ) {
            contadorMalas++;
          }
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
  batchesController.getBatchTestResults
);

module.exports = router;
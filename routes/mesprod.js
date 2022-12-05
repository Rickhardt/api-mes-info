//third-party packages
const express = require("express");
const { body } = require("express-validator");

//Custom references
const batchesController = require("../controllers/batches");
const productController = require("../controllers/product");
const equipmentController = require("../controllers/equipment");

const router = express.Router();

//Cuenta cuantos elementos del JSON tienen pares llave-valor de más (o menos)
//Se usa en las comprobaciones personalizadas.
let contadorMalas = 0;
const productQueriesKeys = ["PRODUCTO"];
const batchQueriesKeys = ["BATCH"];
const eqpQueriesKeys = ["EQUIPO"];

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
  batchesController.getBatchActualPosition
);

router.get("/processplan", productController.getProcessPlans);

router.get(
  "/eqpattrib",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;

        Object.keys(req.body).forEach((element) => {
          if (
            !Object.keys(req.body[element]).every((key) => {
              return eqpQueriesKeys.includes(key);
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
  equipmentController.getEquipmentAttributes
);

//router.get("/batchdefects", batchesController.getBatchDefects);

router.get(
  "/productattrib",
  [
    body()
      .custom((body, { req }) => {
        contadorMalas = 0;
        //Expresión regular para determinar que string en JSON es una cadena válida para producto
        //de Proceso Químico o Ensamble
        let regEx =
          /\w{3}\d{3}[J,K,M]{1}[0,1]{1}[A,C,D,E,G,J,T,V,X]{1}\w{1,6}/g;
        //Expresión regular para asegurar que string de JSON tiene una cadena con la misma estructura
        //que la de un producto de Pressing. Se verifica que comience de manera similar y tenga la misma extensión
        let regExPressProducts = /^[PTR, POR, PTN]{1}\w{13}/g;
        let regExResult = false;
        let regExPressProductsResult = false;

        Object.keys(req.body).forEach((element) => {
          if (req.body[element]["PRODUCTO"].match(regEx) == null) {
            regExResult = true;
          } else {
            regExResult = false;
          }

          if (req.body[element]["PRODUCTO"].match(regExPressProducts) == null) {
            regExPressProductsResult = true;
          } else {
            regExPressProductsResult = false;
          }

          if (
            !Object.keys(req.body[element]).every((key) => {
              return productQueriesKeys.includes(key);
            }) ||
            (regExPressProductsResult && regExPressProductsResult)
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
  productController.getProductAttributes
);

module.exports = router;

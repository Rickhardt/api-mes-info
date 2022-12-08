//third-party packages
const { validationResult } = require("express-validator");

//Custom References
const RepmesTables = require("../util/database");

//Variables
let batch;
let test;
let contador;
let sql;

///Información de las razones de rechazo según el paso
///Extraído de MES
exports.getRejectCodes = (req, res, next) => {
  //const errors = validationResult(req);
  sql = "";

  /*if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }*/
  console.log(req.params);

  const rejectCodesStep = req.params.stepName;
  let responseToSend = {
    MENSAJE: "Razones de rechazo del paso enviado.",
  };

  batch = [];

  //Formando la sentencia para número desconocido de valores
  sql =
    "SELECT STEP_NAME, REJECT_CODE, REJECT_CATEGORY, STATE, DESCRIPTION, DESCRIPTION_LL, SHORTCUT, UNITS_LL " +
    "FROM FW_PROD.FWCATNS_REJECT_CODES " +
    "WHERE STEP_NAME = :v0";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, [rejectCodesStep])
            .then((results) => {
              results.rows.push(responseToSend);
              res.status(200).json(results.rows);
            })
            .catch((error) => {
              res.status(422).json({
                MENSAJE: error.message,
                ERRORES: error,
              });
            });
        });
      })
      .catch((error) => {
        res.status(422).json({
          MENSAJE: error.message,
          ERRORES: error.array(),
        });
      })
  );
};

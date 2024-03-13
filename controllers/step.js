//third-party packages
const { validationResult } = require("express-validator");

//Custom References
const RepmesTables = require("../util/database");

//Variables
let step;
let sql;

 /*Retorna la cantidad de reglas que tiene un paso en específico.
 * Recordar que a la cantidad hay que restarle 1 porque la secuencia comienza con 0
 * Extraído de MES
 */
 exports.getStepRuleCount = (req, res, next) => {
    const errors = validationResult(req);
    sql = "";
  
    if (!errors.isEmpty()) {
      return res.json({
        ERRORES: errors.array(),
      });
    }
  
    const step = req.params.stepname;
  
    //Formando la sentencia para número desconocido de valores
    sql = `SELECT COUNT(E.NAME) AS "CountRule"
           FROM FW_PROD.FWSTEP A
           INNER JOIN FW_PROD.FWSTEP_N2M B ON B.FROMID = A.SYSID
           INNER JOIN FW_PROD.FWSTEPVERSION C ON C.SYSID = B.TOID
           INNER JOIN FW_PROD.FWSTEPVERSION_N2M D ON D.FROMID = C.SYSID
           INNER JOIN FW_PROD.FWPRPRULE E ON E.SYSID = D.TOID
           WHERE A.NAME = :v0 AND C.REVSTATE = 'Active'`;
  
    //Ejecutando consulta en la base de datos
    RepmesTables.credentialResults("MESSALPROD").then((results) =>
      RepmesTables.connectionRepmes(results, "MESSALPROD")
        .then((results) => {
          results.getConnection().then((oracleDbConnection) => {
            oracleDbConnection
              .execute(sql, [step])
              .then((results) => {
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
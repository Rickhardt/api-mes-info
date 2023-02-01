//third-party packages
const { validationResult } = require("express-validator");
const oracledb = require("oracledb");
const { autoCommit } = require("oracledb");

//Custom References
const RepmesTables = require("../util/database");

//Variables
let batch;
let locator;
let buffer;
let user;
let occupied;
let capacity;
let test;
let contador;
let sql;

let yearActual;
let monthActual;
let dayActual;
let hourActual;
let minutesActual;
let secondsActual;

//Array de valores que se van a insertar en una tabla
const arrayValuesToInsert = Array();

//Array de valores a modificar en tabla
const arrayValuesToModify = Array();

/****************************** GET methods **********************************/

///Información de las razones de rechazo según el paso
///Extraído de MES
exports.getRejectCodes = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

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

///Cantidad de ubicaciones disponibles para un Buffer determinado
///Extraído de MES
exports.getAvailableLocators = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

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

/****************************** POST methods **********************************/

///Inserta localizadores nuevos
///Inserción a MES
exports.postNewLocators = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";
  user = "";
  let commitingUser = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  //Se forma la hora con el formato aceptado actualmente por Factory Works
  const dateActual = new Date();

  yearActual = dateActual.toLocaleDateString("es-SV", { year: "numeric" });
  monthActual = dateActual.toLocaleDateString("es-SV", {
    month: "2-digit",
  });
  dayActual = dateActual.toLocaleDateString("es-SV", { day: "2-digit" });

  hourActual = dateActual.toLocaleTimeString("es-SV", {
    hour: "2-digit",
    hour12: false,
  });
  minutesActual = dateActual.toLocaleTimeString("es-SV", {
    minute: "2-digit",
  });
  secondsActual = dateActual.toLocaleTimeString("es-SV", {
    second: "2-digit",
  });

  formattedDate =
    yearActual +
    monthActual +
    dayActual +
    " " +
    hourActual +
    minutesActual +
    secondsActual +
    "000";

  arrayValuesToInsert.length = 0;
  locator = [];
  buffer = [];

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "No se puede insertar datos, un par LOCALIZADOR-BUFFER está incompleto. Verifique el cuerpo de la petición",
      });
      break;
    default:
      Object.keys(req.body).forEach((element) => {
        locator.push(req.body[element]["LOCATOR"]);
      });

      Object.keys(req.body).forEach((element) => {
        buffer.push(req.body[element]["BUFFER"]);
      });
      break;
  }

  //Usuario utilizado para la inserción de datos
  user =
    req.body[Object.keys(req.body)[Object.keys(req.body).length - 1]]["USER"];

  //Se verifica que el usuario exista y que tenga permisos de escritura en la base (por el momento esto significa que el rol sea UNIVERSAl)
  //Sentencia a utilizar para la verificación
  sql =
    "SELECT USERNAME, NICKNAME FROM FW_PROD.FWUSERPROFILE WHERE USERNAME = :v1";

  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, [user])
            .then((results) => {
              if (results.rows.length === 0) {
                const error = new Error(
                  "No se encontró ningún registro para el usuario ingresado. Verifique que fue escrito de forma correcta y pruebe de nuevo."
                );

                error.statusCode = 404;
                throw error;
              }

              if (results.rows[0]["NICKNAME"] === null) {
                commitingUser = results.rows[0]["USERNAME"];
              } else {
                commitingUser = results.rows[0]["NICKNAME"];
              }

              //Formando la sentencia para número desconocido de valores
              sql =
                "INSERT INTO FW_PROD.FWCATNS_LOCATIONS VALUES(:v1, :v2, :v3, :v4, :v5, :v6, :v7)";

              for (let index = 0; index < locator.length; index++) {
                //Valores a insertar en tabla
                arrayValuesToInsert[index] = [
                  buffer[index], //Tipo de bodega
                  locator[index], //Ubicación física en bodega
                  null, //Lote actual en ubicación
                  0, //Ocupado (sí, no)
                  1, //Disponibilidad (sí, no)
                  commitingUser, //Usuario que agregó las ubicaciones
                  formattedDate, //Fecha en la que se realizó la inserción
                ];
              }

              const executionOptions = {
                autoCommit: true,
                batcheErrors: true,
                bindDefs: [
                  { type: oracledb.STRING, maxSize: 8 },
                  { type: oracledb.STRING, maxSize: 8 },
                  { type: oracledb.STRING, maxSize: 15 },
                  { type: oracledb.NUMBER },
                  { type: oracledb.NUMBER },
                  { type: oracledb.STRING, maxSize: 100 },
                  { type: oracledb.STRING, maxSize: 18 },
                ],
              };

              //Inserta datos en la tabla
              RepmesTables.connectionMesRW()
                .then((results) => {
                  results.getConnection().then((oracleDbConnection) => {
                    oracleDbConnection
                      .executeMany(sql, arrayValuesToInsert, executionOptions)
                      .then((results) => {
                        if (results.rowsAffected > 0) {
                          res.status(200).json(results.rows);
                        }
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
                });
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

///Inserta localizadores nuevos
///Inserción a MES
exports.postNewLocators = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";
  user = "";
  let commitingUser = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  //Se forma la hora con el formato aceptado actualmente por Factory Works
  const dateActual = new Date();

  yearActual = dateActual.toLocaleDateString("es-SV", { year: "numeric" });
  monthActual = dateActual.toLocaleDateString("es-SV", {
    month: "2-digit",
  });
  dayActual = dateActual.toLocaleDateString("es-SV", { day: "2-digit" });

  hourActual = dateActual.toLocaleTimeString("es-SV", {
    hour: "2-digit",
    hour12: false,
  });
  minutesActual = dateActual.toLocaleTimeString("es-SV", {
    minute: "2-digit",
  });
  secondsActual = dateActual.toLocaleTimeString("es-SV", {
    second: "2-digit",
  });

  formattedDate =
    yearActual +
    monthActual +
    dayActual +
    " " +
    hourActual +
    minutesActual +
    secondsActual +
    "000";

  arrayValuesToInsert.length = 0;
  locator = [];
  buffer = [];

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "No se puede insertar datos, un par LOCALIZADOR-BUFFER está incompleto. Verifique el cuerpo de la petición",
      });
      break;
    default:
      Object.keys(req.body).forEach((element) => {
        locator.push(req.body[element]["LOCATOR"]);
      });

      Object.keys(req.body).forEach((element) => {
        buffer.push(req.body[element]["BUFFER"]);
      });
      break;
  }

  //Usuario utilizado para la inserción de datos
  user =
    req.body[Object.keys(req.body)[Object.keys(req.body).length - 1]]["USER"];

  //Se verifica que el usuario exista y que tenga permisos de escritura en la base (por el momento esto significa que el rol sea UNIVERSAl)
  //Sentencia a utilizar para la verificación
  sql =
    "SELECT USERNAME, NICKNAME FROM FW_PROD.FWUSERPROFILE WHERE USERNAME = :v1 AND USERGROUP = 'Universal'";

  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, [user])
            .then((results) => {
              if (results.rows.length === 0) {
                const error = new Error(
                  "No se encontró ningún registro para el usuario ingresado. Verifique que fue escrito de forma correcta y pruebe de nuevo."
                );

                error.statusCode = 404;
                throw error;
              }

              if (results.rows[0]["NICKNAME"] === null) {
                commitingUser = results.rows[0]["USERNAME"];
              } else {
                commitingUser = results.rows[0]["NICKNAME"];
              }

              //Formando la sentencia para número desconocido de valores
              sql =
                "INSERT INTO FW_PROD.FWCATNS_LOCATIONS VALUES(:v1, :v2, :v3, :v4, :v5, :v6, :v7)";

              for (let index = 0; index < locator.length; index++) {
                //Valores a insertar en tabla
                arrayValuesToInsert[index] = [
                  buffer[index], //Tipo de bodega
                  locator[index], //Ubicación física en bodega
                  null, //Lote actual en ubicación
                  0, //Ocupado (sí, no)
                  1, //Disponibilidad (sí, no)
                  commitingUser, //Usuario que agregó las ubicaciones
                  formattedDate, //Fecha en la que se realizó la inserción
                ];
              }

              const executionOptions = {
                autoCommit: true,
                batcheErrors: true,
                bindDefs: [
                  { type: oracledb.STRING, maxSize: 8 },
                  { type: oracledb.STRING, maxSize: 8 },
                  { type: oracledb.STRING, maxSize: 15 },
                  { type: oracledb.NUMBER },
                  { type: oracledb.NUMBER },
                  { type: oracledb.STRING, maxSize: 100 },
                  { type: oracledb.STRING, maxSize: 18 },
                ],
              };

              //Inserta datos en la tabla
              RepmesTables.connectionMesRW()
                .then((results) => {
                  results.getConnection().then((oracleDbConnection) => {
                    oracleDbConnection
                      .executeMany(sql, arrayValuesToInsert, executionOptions)
                      .then((results) => {
                        if (results.rowsAffected > 0) {
                          res.status(200).json(results.rows);
                        }
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
                });
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

/************************************* PUT methods ****************************************/

//Actualiza localizadores
//Base afectada: MESSALPROD
exports.putUpdateLocators = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";
  user = "";
  let commitingUser = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  //Se forma la hora con el formato aceptado actualmente por Factory Works
  const dateActual = new Date();

  yearActual = dateActual.toLocaleDateString("es-SV", { year: "numeric" });
  monthActual = dateActual.toLocaleDateString("es-SV", {
    month: "2-digit",
  });
  dayActual = dateActual.toLocaleDateString("es-SV", { day: "2-digit" });

  hourActual = dateActual.toLocaleTimeString("es-SV", {
    hour: "2-digit",
    hour12: false,
  });
  minutesActual = dateActual.toLocaleTimeString("es-SV", {
    minute: "2-digit",
  });
  secondsActual = dateActual.toLocaleTimeString("es-SV", {
    second: "2-digit",
  });

  formattedDate =
    yearActual +
    monthActual +
    dayActual +
    " " +
    hourActual +
    minutesActual +
    secondsActual +
    "000";

  arrayValuesToModify.length = 0;
  locator = [];
  occupied = [];
  capacity = [];
  batch = [];

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "No se puede insertar datos, un par LOCALIZADOR-BUFFER está incompleto. Verifique el cuerpo de la petición",
      });
      break;
    default:
      Object.keys(req.body).forEach((element) => {
        locator.push(req.body[element]["LOCATOR"]);
        occupied.push(parseInt(req.body[element]["OCCUPIED"]));
        capacity.push(parseInt(req.body[element]["CAPACITY"]));

        if (
          req.body[element]["BATCH"] === "null" ||
          req.body[element]["BATCH"] === "NULL"
        ) {
          batch.push(null);
        } else {
          batch.push(req.body[element]["BATCH"]);
        }
      });
      break;
  }

  //Usuario utilizado para la inserción de datos
  user =
    req.body[Object.keys(req.body)[Object.keys(req.body).length - 1]]["USER"];

  //Se verifica que el usuario exista y que tenga permisos de escritura en la base (por el momento esto significa que el rol sea UNIVERSAl)
  //Sentencia a utilizar para la verificación
  sql =
    "SELECT USERNAME, NICKNAME FROM FW_PROD.FWUSERPROFILE WHERE USERNAME = :v1 AND USERGROUP = 'Universal'";

  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, [user])
            .then((results) => {
              if (results.rows.length === 0) {
                const error = new Error(
                  "No se encontró ningún registro para el usuario ingresado. Verifique que fue escrito de forma correcta y pruebe de nuevo."
                );

                error.statusCode = 404;
                throw error;
              }

              if (results.rows[0]["NICKNAME"] === null) {
                commitingUser = results.rows[0]["USERNAME"];
              } else {
                commitingUser = results.rows[0]["NICKNAME"];
              }

              //Formando la sentencia para número desconocido de valores
              sql =
                "UPDATE FW_PROD.FWCATNS_LOCATIONS " +
                "SET CURRENT_LOT = :v1, OCCUPIED = :v2, CAPACITY = :v3, USERID = :v4, TIMEOFCHANGE = :v5 " +
                "WHERE LOCATION = :v6";

              for (let index = 0; index < locator.length - 1; index++) {
                //Valores a insertar en tabla
                arrayValuesToModify[index] = [
                  batch[index], //Lote actual en ubicación
                  occupied[index], //Ocupado (sí, no)
                  capacity[index], //Disponibilidad (sí, no)
                  commitingUser, //Usuario que agregó las ubicaciones
                  formattedDate, //Fecha en la que se realizó la inserción
                  locator[index], //Ubicación física en bodega,
                ];
              }

              const executionOptions = {
                autoCommit: true,
                batcheErrors: true,
                bindDefs: [
                  { type: oracledb.STRING, maxSize: 15 },
                  { type: oracledb.NUMBER },
                  { type: oracledb.NUMBER },
                  { type: oracledb.STRING, maxSize: 100 },
                  { type: oracledb.STRING, maxSize: 18 },
                  { type: oracledb.STRING, maxSize: 18 },
                ],
              };

              console.log(arrayValuesToModify);

              //Inserta datos en la tabla
              RepmesTables.connectionMesRW()
                .then((results) => {
                  results.getConnection().then((oracleDbConnection) => {
                    oracleDbConnection
                      .executeMany(sql, arrayValuesToModify, executionOptions)
                      .then((results) => {
                        if (results.rowsAffected > 0) {
                          res.status(200).json(results.rows);
                        }
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
                });
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

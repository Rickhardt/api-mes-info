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

///Información de la recete de AcidClean para los lotes de proceso quimico
///Extraído de MES
exports.getBatchRecipe = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  const batch = req.params.batch;

  //Formando la sentencia para número desconocido de valores
  sql =
    "WITH PART_NBR_OLD AS " +
    "(SELECT A.NAME AS PRODUCTNAME, G.NAME AS ATTRIBUTE, F.MAGNITUDE " +
    "      FROM FW_PROD.FWPRODUCT A " +
    "      INNER JOIN FW_PROD.FWPRODUCT_N2M B ON B.FROMID = A.SYSID " +
    "      INNER JOIN FW_PROD.FWPRODUCTVERSION C ON C.SYSID = B.TOID " +
    "      INNER JOIN FW_PROD.FWPRODUCTVERSION_N2M D ON D.FROMID = C.SYSID " +
    "      INNER JOIN FW_PROD.FWPRPATTRIBUTEINSTANCE F ON F.SYSID = D.TOID " +
    "      INNER JOIN FW_PROD.FWPRPATTRIBUTE G ON G.SYSID = F.ATTRCLASS " +
    "      WHERE C.REVSTATE = 'Active' AND D.KEYDATA = 'Form_Recipe') " +
    "SELECT A.PRODUCTNAME, I.PARAMETER_NAME, I.RECIPE_NAME, I.PARAMETER_VALUE_STRING, " +
    "     A.COMPONENTQTY, H.VALDATA AS QTY_PALLETS, C.STEPNAME " +
    "FROM FW_PROD.FWLOT A " +
    "INNER JOIN FW_PROD.FWLOT_N2M B ON B.FROMID = A.SYSID " +
    "INNER JOIN FW_PROD.FWWIPSTEP C ON C.SYSID = B.TOID " +
    "INNER JOIN FW_PROD.FWWIPSTEP_N2M E ON E.FROMID = C.SYSID AND C.CURRENTRULEINDEX = E.SEQUENCE " +
    "INNER JOIN FW_PROD.FWWIPSTEPRULE F ON F.SYSID = E.TOID " +
    "INNER JOIN PART_NBR_OLD G ON G.PRODUCTNAME = A.PRODUCTNAME " +
    "INNER JOIN FW_PROD.FWLOT_PN2M H ON H.FROMID = A.SYSID " +
    "INNER JOIN FW_PROD.FWCATNS_PROCESS_RECIPES I ON I.RECIPE_NAME = G.MAGNITUDE AND I.PARAMETER_NAME = 'Acid_Clean' " +
    "WHERE A.APPID = :v0 AND H.KEYDATA = 'QTY_PALLETS' AND I.STATE = 'Active'";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, [batch])
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

///Retorna el nombre asociado al badge en la tabla FWCATNS_OPERATORS. De no existir retorna un espacio en blanco
///Extraído de MES
exports.getOperatorName = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  const badge = req.params.badge;

  //Formando la sentencia para número desconocido de valores
  sql =
    `SELECT NVL((FIRST_NAME || LAST_NAME), '') AS "userName"
     FROM FW_PROD.FWCATNS_OPERATORS
     WHERE PERSONAL_ID = :v0`;

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, [badge])
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

///Cantidad de ubicaciones disponibles para un Buffer determinado
///Extraído de MES
exports.getAvailableLocators = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";
  let protoResponse = null;
  let connectionResource = null;

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  const buffer = req.params.bufferName;
  let responseToSend = {
    MENSAJE:
      "Se toma como ubicación disponible la que cumpla la siguiente condición: (OCCUPIED = 0 AND CAPACITY = 1 AND CURRENT_LOT IS NULL)",
  };

  batch = [];

  //Formando la sentencia para número desconocido de valores
  sql =
    "SELECT LOCATION, USERID, TIMEOFCHANGE " +
    "FROM FW_PROD.FWCATNS_LOCATIONS " +
    "WHERE BUFFER = :v0 AND OCCUPIED = 0 AND CAPACITY = 1 AND CURRENT_LOT IS NULL";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        connectionResource = results;
        //Retorna las ubicaciones que están disponibles, el último usuario que modificó el estado de la ubicación y la hora en que sucedió
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, [buffer])
            .then((results) => {
              protoResponse = results.rows;
            }) //Obtiene el total de ubicaciones que se consideran disponibles
            .then((results) => {
              connectionResource.getConnection().then((oracleDbConnection) => {
                sql =
                  "SELECT COUNT(*) Total_Ubicaciones_Disponibles " +
                  "FROM FW_PROD.FWCATNS_LOCATIONS " +
                  "WHERE BUFFER = :v0 AND OCCUPIED = 0 AND CAPACITY = 1 AND CURRENT_LOT IS NULL";

                oracleDbConnection
                  .execute(sql, [buffer])
                  .then((results) => {
                    protoResponse.push(results.rows);
                    protoResponse.push(responseToSend);
                    res.status(200).json(protoResponse);
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

///Retorna información de ubicaciones de buffer según petición del usuario. Las consultas se generan basados en estos parámetros
///Extraído de MES
exports.getLocationInformation = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  //Variables para determinar si se han enviado ubicaciones en específico o no
  let initialNumberFieldsSet = false;
  let finalNumberFieldsSet = false;

  //Variables que tendran las ubicaciones en específico
  let initialNumberFields;
  let finalNumberFields;

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let bufferType = "";
  const estadoBuffer = req.query.estadoBuffer;

  if (req.query.initialNumberFields != null) {
    initialNumberFieldsSet = true;
    initialNumberFields = req.query.initialNumberFields;
  }

  if (req.query.finalNumberFields != null) {
    finalNumberFieldsSet = true;
    finalNumberFields = req.query.finalNumberFields;
  }

  switch (req.query.bufferType) {
    case "paBuffer":
      bufferType = "PABUFFER";
      break;
    case "raBuffer":
      bufferType = "RABUFFER";
      break;
      case "rnBuffer":
        bufferType = "RNBUFFER";
        break;
    case "cfBuffer":
      bufferType = "CFBUFFER";
      break;
    default:
      bufferType = "RABUFFER";
      break;
  }

  //Conformal y solo las ubicaciones que se ingresaron (sino todas las ubicaciones)
  if (estadoBuffer == "all" && bufferType == "CFBUFFER") {
    /// Se comprueba si los usuarios han ingresado un rango específico de ubicaciones, de no haberlas retorna todas las ubicaciones creadas para el buffer seleccionado.
    /// Luego arma la consulta dependiendo de cuantos "rangos" diferentes se ingresaron. En caso de ser más de 1 la consulta se construye con UNION para retornar los diferentes rangos en una sola respuesta
    if (initialNumberFieldsSet && finalNumberFieldsSet) {
      for (i = 0; i < initialNumberFields.length; i++) {
        if (i == initialNumberFields.length - 1) {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '^CF\\\\d{2,4}$')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 3)) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 3)) <= ` +
            parseInt(finalNumberFields[i]) +
            `)`;
        } else {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '^CF\\\\d{2,4}$')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 3)) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 3)) <= ` +
            parseInt(finalNumberFields[i]) +
            `) UNION `;
        }
      }
    } else {
      sql =
        `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
        `FROM FW_PROD.FWCATNS_LOCATIONS ` +
        `WHERE BUFFER = '` +
        bufferType +
        `'`;
    }
    //Conformal y solo ubicaciones activas
  } else if (estadoBuffer == "available" && bufferType == "CFBUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      `FROM FW_PROD.FWCATNS_LOCATIONS ` +
      `WHERE BUFFER = 'CFBUFFER' AND REGEXP_LIKE(LOCATION, '^\\\w{2}\\\d{2,4}') AND ` +
      `      ((OCCUPIED = 1 AND CAPACITY = 1 AND CURRENT_LOT != 'INVALID') OR ` +
      `     (OCCUPIED = 0 AND CAPACITY = 1 AND CURRENT_LOT IS NULL))`;
    //Conformal y solo ubicaciones inactivas
  } else if (estadoBuffer == "disable" && bufferType == "CFBUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      `FROM FW_PROD.FWCATNS_LOCATIONS ` +
      `WHERE BUFFER = 'CFBUFFER' AND REGEXP_LIKE(LOCATION, '^\\\w{2}\\\d{2,4}') AND ` +
      `      (OCCUPIED = 0 AND CAPACITY = 0 AND (CURRENT_LOT = 'INVALID' OR CURRENT_LOT IS NULL))`;
    //Cualquiera que no sea Conformal y solo las que se seleccionaron (sino todas las ubicaciones)
  } else if (estadoBuffer == "all" && bufferType == "RABUFFER") {
    if (initialNumberFieldsSet && finalNumberFieldsSet) {
      for (i = 0; i < initialNumberFields.length; i++) {
        if (i == initialNumberFields.length - 1) {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '\\\w{1,2}\\\d{2,4}\\\w{1}')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) <= ` +
            parseInt(finalNumberFields[i]) +
            `)`;
        } else {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '\\\w{1,2}\\\d{2,4}\\\w{1}')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) <= ` +
            parseInt(finalNumberFields[i]) +
            `) UNION `;
        }
      }
    } else {
      sql =
        `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
        `FROM FW_PROD.FWCATNS_LOCATIONS ` +
        `WHERE BUFFER = '` +
        bufferType +
        `'`;
    }
    //Conformal y solo ubicaciones activas
  } else if (estadoBuffer == "available" && bufferType == "RABUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      ` FROM FW_PROD.FWCATNS_LOCATIONS ` +
      ` WHERE BUFFER = 'RABUFFER' AND REGEXP_LIKE(LOCATION, '\\\w{1,2}\\\d{2,4}\\\w{1}') AND ` +
      `       (OCCUPIED = 0 AND CAPACITY = 1 AND CURRENT_LOT IS NULL)`;
    //Conformal y solo ubicaciones inactivas
  } else if (estadoBuffer == "disable" && bufferType == "RABUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      `FROM FW_PROD.FWCATNS_LOCATIONS ` +
      `WHERE BUFFER = 'RABUFFER' AND REGEXP_LIKE(LOCATION, '\\\w{1,2}\\\d{2,4}\\\w{1}') AND ` +
      `      (OCCUPIED = 0 AND CAPACITY = 0 AND CURRENT_LOT = 'INVALID')`;
    //Cualquiera que no sea Conformal y solo las que se seleccionaron (sino todas las ubicaciones)
  } else if (estadoBuffer == "all" && bufferType == "RNBUFFER") {
    if (initialNumberFieldsSet && finalNumberFieldsSet) {
      for (i = 0; i < initialNumberFields.length; i++) {
        if (i == initialNumberFields.length - 1) {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '\\\w{1,2}\\\d{2,4}\\\w{1}')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) <= ` +
            parseInt(finalNumberFields[i]) +
            `)`;
        } else {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '^\\\\w{2}\\\\d{3,4}\\\\w{1}')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 3, (LENGTH(LOCATION) - 3))) <= ` +
            parseInt(finalNumberFields[i]) +
            `) UNION `;
        }
      }
    } else {
      sql =
        `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
        `FROM FW_PROD.FWCATNS_LOCATIONS ` +
        `WHERE BUFFER = '` +
        bufferType +
        `'`;
    }
    //RNBUFFER y solo ubicaciones activas
  } else if (estadoBuffer == "available" && bufferType == "RNBUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      ` FROM FW_PROD.FWCATNS_LOCATIONS ` +
      ` WHERE BUFFER = 'RNBUFFER' AND REGEXP_LIKE(LOCATION, '\\\w{1,2}\\\d{2,4}\\\w{1}') AND ` +
      `      (OCCUPIED = 0 AND CAPACITY = 0 AND (CURRENT_LOT = 'INVALID' OR CURRENT_LOT IS NULL))`;
    //RNBUFFER y solo ubicaciones inactivas
  } else if (estadoBuffer == "disable" && bufferType == "RNBUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      `FROM FW_PROD.FWCATNS_LOCATIONS ` +
      `WHERE BUFFER = 'RNBUFFER' AND REGEXP_LIKE(LOCATION, '\\\w{1,2}\\\d{2,4}\\\w{1}') AND ` +
      `   ((OCCUPIED = 1 AND CAPACITY = 1 AND CURRENT_LOT != 'INVALID') OR ` +
      `    (OCCUPIED = 0 AND CAPACITY = 1 AND CURRENT_LOT IS NULL))`;
    //Cualquiera que no sea RNBUFFER y solo las que se seleccionaron (sino todas las ubicaciones)
  } else if (estadoBuffer == "all" && bufferType == "PABUFFER") {
    if (initialNumberFieldsSet && finalNumberFieldsSet) {
      for (i = 0; i < initialNumberFields.length; i++) {
        if (i == initialNumberFields.length - 1) {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '^C\\\\d{3}\\\\w{1}')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 2, 3)) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 2, 3)) <= ` +
            parseInt(finalNumberFields[i]) +
            `)`;
        } else {
          sql =
            sql +
            `SELECT * FROM (SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
            `FROM FW_PROD.FWCATNS_LOCATIONS ` +
            `WHERE BUFFER = '` +
            bufferType +
            `' AND REGEXP_LIKE(LOCATION, '^C\\\\d{3}\\\\w{1}')) WHERE ` +
            `(TO_NUMBER(SUBSTR(LOCATION, 2, 3)) >= ` +
            parseInt(initialNumberFields[i]) +
            ` AND ` +
            `TO_NUMBER(SUBSTR(LOCATION, 2, 3)) <= ` +
            parseInt(finalNumberFields[i]) +
            `) UNION `;
        }
      }
    } else {
      sql =
        `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
        `FROM FW_PROD.FWCATNS_LOCATIONS ` +
        `WHERE BUFFER = '` +
        bufferType +
        `'`;
    }
    //Conformal y solo ubicaciones activas
  } else if (estadoBuffer == "available" && bufferType == "PABUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      ` FROM FW_PROD.FWCATNS_LOCATIONS ` +
      ` WHERE BUFFER = 'PABUFFER' AND REGEXP_LIKE(LOCATION, '^C\\\d{2,4}\\\w{1}') AND ` +
      `      (OCCUPIED = 0 AND CAPACITY = 0 AND (CURRENT_LOT = 'INVALID' OR CURRENT_LOT IS NULL))`;
    //Conformal y solo ubicaciones inactivas
  } else if (estadoBuffer == "disable" && bufferType == "PABUFFER") {
    sql =
      `SELECT BUFFER, LOCATION, CURRENT_LOT, OCCUPIED, CAPACITY, USERID, TIMEOFCHANGE ` +
      `FROM FW_PROD.FWCATNS_LOCATIONS ` +
      `WHERE BUFFER = 'PABUFFER' AND REGEXP_LIKE(LOCATION, '^C\\\d{2,4}') AND ` +
      `   ((OCCUPIED = 1 AND CAPACITY = 1 AND CURRENT_LOT != 'INVALID') OR ` +
      `    (OCCUPIED = 0 AND CAPACITY = 1 AND CURRENT_LOT IS NULL))`;
    //Cualquiera que no sea Conformal y solo las que se seleccionaron (sino todas las ubicaciones)
  }

  console.log(sql);

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql)
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
          MENSAJE: error.code,
          ERRORES: error.message,
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
  bufferType = "";

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

      bufferType = req.body[0]["BUFFER"];
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
                commitingUser = user;
              } else {
                commitingUser = results.rows[0]["NICKNAME"];
              }

              //Formando la sentencia para número desconocido de valores
              sql =
                "UPDATE FW_PROD.FWCATNS_LOCATIONS " +
                "SET CURRENT_LOT = :v1, OCCUPIED = :v2, CAPACITY = :v3, USERID = :v4, TIMEOFCHANGE = :v5 " +
                "WHERE LOCATION = :v6 AND BUFFER = '" + bufferType + "'";

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
          MENSAJE: error.code,
          ERRORES: error.message,
        });
      })
  );
};

//third-party packages
const { validationResult } = require("express-validator");

//Custom References
const RepmesTables = require("../util/database");

//Variables
let batch;
let test;
let contador;
let sql;

///Información acerca del estado, último paso y última ubicación de un lote hasta el último TrackOut
///Extraído de REPMES
exports.getBatchInfo = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE: "Información del estado del lote hasta el último TrackOut.",
  };

  batch = [];

  if (Object.keys(req.body).length > 1000) {
    return res.status(422).json({
      MENSAJE:
        "Las consultas en ORACLE solo aceptan 1000 valores dentro de una condición IN.",
    });
  }

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "Para obtener resultados debe enviar al menos 1 BATCH en el cuerpo de la petición.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        batch.push(req.body[index.toString()]["BATCH"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  sql = `SELECT *
         FROM MANUFACT_HIST.FACT_BATCH
         WHERE BATCH IN (`;

  for (let index = 0; index < batch.length; index++) {
    if (index == 0) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ")";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("REPSALPROD_RM").then((results) =>
    RepmesTables.connectionRepmes(results, "REPSALPROD").then((results) => {
      results.getConnection().then((oracleDbConnection) => {
        oracleDbConnection
          .execute(sql, batch)
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
  );
};

///Información de los atributos de un lote hasta el último TrackOut
///Extraído de REPMES
exports.getBatchAttrib = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE: "Información de los atributos del lote hasta el último TrackOut.",
  };

  batch = [];

  if (Object.keys(req.body).length > 1000) {
    return res.status(422).json({
      MENSAJE:
        "Las consultas en ORACLE solo aceptan 1000 valores dentro de una condición IN.",
    });
  }

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "Para obtener resultados debe enviar al menos 1 BATCH en el cuerpo de la petición.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        batch.push(req.body[index.toString()]["BATCH"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  sql = `SELECT RECORDED_DATE, BATCHNO, ATTRIBUTE, ATTRIBUTE_VALUE,
                OCCURSINSTEP, LOCATION, HANDLE
         FROM MANUFACT_HIST.FACT_LOT_ATTRIBUTES
         WHERE BATCHNO IN (`;

  for (let index = 0; index < batch.length; index++) {
    if (index == 0) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ")";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("REPSALPROD_RM").then((results) =>
    RepmesTables.connectionRepmes(results, "REPSALPROD").then((results) => {
      results.getConnection().then((oracleDbConnection) => {
        oracleDbConnection
          .execute(sql, batch)
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
  );
};

///Información de los pasos de un lote hasta el último TrackOut
///Extraído de REPMES
exports.getBatchStep = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE: "Información de los pasos del lote hasta el último TrackOut.",
  };

  batch = [];

  if (Object.keys(req.body).length > 1000) {
    return res.status(422).json({
      MENSAJE:
        "Las consultas en ORACLE solo aceptan 1000 valores dentro de una condición IN.",
    });
  }

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "Para obtener resultados debe enviar al menos 1 BATCH en el cuerpo de la petición.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        batch.push(req.body[index.toString()]["BATCH"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  sql = `SELECT A.BATCH, B.PART_TYPE, B.OLD_PART_TYPE, A.MES_STEP_NAME, A.HANDLE,
                A.STEP_DATETIME, A.FISCAL_DATE, A.SHIFT, A.EQP, A.ENTERED_BY,
                A.QTY_PCS, A.SCRAPPED_PCS, A.HANDLING_TIME
         FROM MANUFACT_HIST.FACT_STEP_V A
         INNER JOIN MANUFACT_HIST.FACT_BATCH B ON B.BATCH = A.BATCH
         WHERE A.BATCH IN (`;

  for (let index = 0; index < batch.length; index++) {
    if (index == 0) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ")";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("REPSALPROD_RM").then((results) =>
    RepmesTables.connectionRepmes(results, "REPSALPROD").then((results) => {
      results.getConnection().then((oracleDbConnection) => {
        oracleDbConnection
          .execute(sql, batch)
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
  );
};

///Información de los defectos de un lote hasta el último TrackOut
///Extraído de REPMES
exports.getBatchDefects = (req, res, next) => {
  const errors = validationResult(req);
  let totalProcessedUnits;
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE:
      "Información de los defectos y rechazos de un lote hasta el último TrackOut.",
  };

  batch = [];

  if (Object.keys(req.body).length > 1000) {
    return res.status(422).json({
      MENSAJE:
        "Las consultas en ORACLE solo aceptan 1000 valores dentro de una condición IN.",
    });
  }

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "Para obtener resultados debe enviar al menos 1 BATCH en el cuerpo de la petición.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        batch.push(req.body[index.toString()]["BATCH"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  sql = `SELECT NVL(QTY_PCS, 0) AS QTY_PCS
         FROM MANUFACT_HIST.FACT_STEP
         WHERE MES_STEP_NAME = 'S_ASO_SamXRay' AND BATCH IN (`;

  for (let index = 0; index < batch.length; index++) {
    if (index == 0) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ")";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("REPSALPROD_RM").then((results) =>
    RepmesTables.connectionRepmes(results, "REPSALPROD").then((results) => {
      results.getConnection().then((oracleDbConnection) => {
        oracleDbConnection.execute(sql, batch).then((results) => {
          //totalProcessedUnits = parseInt(results.rows[0]["QTY_PCS"]);
          totalProcessedUnits = [];
          sql = "";
          let sqlCaseStatement = "";

          for (
            let index = 0;
            index < Object.keys(results.rows).length;
            index++
          ) {
            totalProcessedUnits.push(results.rows[index]["QTY_PCS"]);
          }

          sql = `SELECT BATCH, PART_TYPE, (GOOD_UNITS + SUM(SCRAP)) AS PROCESSED_UNITS, GOOD_UNITS AS GOOD_UNITS,
                        NVL(SUM(SCRAP), 0) AS SCRAP_PER_AREA, NVL(TESTED_QTY, 0) AS TESTED_QTY,
	                      CASE `;

          for (let index = 0; index < batch.length; index++) {
            sqlCaseStatement +=
              "WHEN MES_STEP_NAME = 'S_ASO_CompleteScan' AND BATCH = " +
              ":v" +
              index.toString() +
              " THEN (" +
              (totalProcessedUnits[index] == null
                ? 0
                : totalProcessedUnits[index]) +
              " - GOOD_UNITS) ";
          }

          sql += sqlCaseStatement;
          sql +=
            "		                      ELSE 0 " +
            "END AS REMANENTE, " +
            "MES_STEP_NAME, STEP_DATETIME, OPERATOR, NVL(SHIFT, 0) AS SHIFT " +
            "FROM ( " +
            "SELECT A.BATCH, A.PART_TYPE, A.QTY_PCS AS GOOD_UNITS, " +
            "       NVL(B.SCRAP, 0) SCRAP, B.TESTED_QTY, A.MES_STEP_NAME, B.REASON, B.D_TYPE, A.STEP_DATETIME, " +
            "       TO_NUMBER(SUBSTR(B.OPERATOR, 1, 5)) AS OPERATOR, B.SHIFT SHIFT " +
            "FROM " +
            "(SELECT C.BATCH, A.PART_TYPE, C.QTY_PCS, C.MES_STEP_NAME, C.STEP_DATETIME " +
            " FROM MANUFACT_HIST.FACT_STEP C " +
            " INNER JOIN MANUFACT_HIST.FACT_BATCH A ON C.BATCH = A.BATCH " +
            " WHERE A.BATCH IN (";

          for (let index = 0; index < batch.length; index++) {
            if (index == 0) {
              sql += ":v" + index.toString();
            } else {
              sql += ", :v" + index.toString();
            }
          }

          sql +=
            ")) A " +
            "LEFT JOIN (SELECT A.BATCHNO, A.PARTTYPE, A.QTY SCRAP, A.TESTED_QTY, A.OCCURSINSTEP, A.REASON, A.D_TYPE, " +
            "                  A.RECORDED_DATE, A.OPERATOR, A.SHIFT " +
            "           FROM MANUFACT_HIST.FACT_SCRAPS_DEFECTS A) B ON B.BATCHNO = A.BATCH AND B.OCCURSINSTEP = A.MES_STEP_NAME) " +
            "GROUP BY BATCH, PART_TYPE, GOOD_UNITS, TESTED_QTY, MES_STEP_NAME, OPERATOR, SHIFT, STEP_DATETIME " +
            "ORDER BY STEP_DATETIME, BATCH";

          oracleDbConnection
            .execute(sql, batch)
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
      });
    })
  );
};

/*Posición actual de un lote. Esto es tal cual aparece en el cliente
 *Retorna:
 *        - Número de lote
 *        - Producto (o "nuevo" número de parte)
 *        - Estado del lote en MES
 *        - PlanName
 *         - Cantidad de unidades al ingresar al paso
 *         - Lote originador
 *         - Producto del lote originador
 *         - Paso actual
 *         - Handle
 *         - Máquina en la que se ha cargado (si se ha cargado a una, en otro caso muestra NULL)
 *         - Esto de la regla actual
 *         - Nombre de la regla que se está ejecutando o que se va a ejecutar (ya sea por intervención de usuario o no)
 *         - Cuando ingreso al paso
 *Extraído de MES*/
exports.getBatchActualPosition = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE:
      "Información actual del lote. Esto es tal cual se ve en el cliente de Factory Works.",
  };

  batch = [];

  if (Object.keys(req.body).length > 1000) {
    return res.status(422).json({
      MENSAJE:
        "Las consultas en ORACLE solo aceptan 1000 valores dentro de una condición IN.",
    });
  }

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE: "No se puede buscar información sin un lote.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        batch.push(req.body[index]["BATCH"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  sql = `WITH PART_NBR_OLD AS
         (SELECT A.NAME AS PRODUCTNAME, F.MAGNITUDE
               FROM FW_PROD.FWPRODUCT A
               INNER JOIN FW_PROD.FWPRODUCT_N2M B ON B.FROMID = A.SYSID
               INNER JOIN FW_PROD.FWPRODUCTVERSION C ON C.SYSID = B.TOID
               INNER JOIN FW_PROD.FWPRODUCTVERSION_N2M D ON D.FROMID = C.SYSID
               INNER JOIN FW_PROD.FWPRPATTRIBUTEINSTANCE F ON F.SYSID = D.TOID
               INNER JOIN FW_PROD.FWPRPATTRIBUTE G ON G.SYSID = F.ATTRCLASS
               WHERE C.REVSTATE = 'Active' AND D.KEYDATA = 'Product_CrossRef_ID')
         SELECT A.APPID, C.PROCESSINGSTATE, A.PRODUCTNAME, G.MAGNITUDE AS OLD_PART_TYPE, A.PLANNAME, A.COMPONENTQTY,
              A.VENDORLOTID, A.VENDORID, C.STEPNAME, C.HANDLE, C.LOCATION, F.RULENAME, C.TIMEHERESINCE
         FROM FW_PROD.FWLOT A
         INNER JOIN FW_PROD.FWLOT_N2M B ON B.FROMID = A.SYSID
         INNER JOIN FW_PROD.FWWIPSTEP C ON C.SYSID = B.TOID
         INNER JOIN FW_PROD.FWWIPSTEP_N2M E ON E.FROMID = C.SYSID AND C.CURRENTRULEINDEX = E.SEQUENCE
         INNER JOIN FW_PROD.FWWIPSTEPRULE F ON F.SYSID = E.TOID
         INNER JOIN PART_NBR_OLD G ON G.PRODUCTNAME = A.PRODUCTNAME
         WHERE A.APPID IN (`;

  for (let index = 0; index < batch.length; index++) {
    if (index == 0) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ")";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, batch)
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

///Información de las mediciones de los lotes para diferentes pruebas (como la WetScan por ejemplo)
exports.getBatchTestResults = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE:
      "Información de las mediciones de los lotes para diferentes pruebas (como la WetScan por ejemplo).",
  };

  batch = [];
  test = [];

  if (Object.keys(req.body).length > 1000) {
    return res.status(422).json({
      MENSAJE:
        "Las consultas en ORACLE solo aceptan 1000 valores dentro de una condición IN.",
    });
  }

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE: "No se puede buscar información sin los pares lote-prueba.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        batch.push(req.body[index]["BATCH"]);
      });

      Object.keys(req.body).forEach((index) => {
        batch.push(req.body[index]["PRUEBA"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  let sql = `SELECT BATCH, PROCESS, TESTED_PARAMETR, TEST_DATE, OPERATOR, PART, PARTTYPE, TEST_RESULT, TEST_COMMENT,
                    TEST_VALUE1, TEST_VALUE2, TEST_VALUE3, TEST_VALUE4, TEST_VALUE5, TEST_VALUE6, TEST_VALUE7, TEST_VALUE8,
                    TEST_VALUE9, TEST_VALUE10, TEST_VALUE11, TEST_VALUE12, TEST_VALUE13, TEST_VALUE14, TEST_VALUE15,
                    TEST_VALUE16, TEST_VALUE17, TEST_VALUE18, TEST_VALUE19, TEST_VALUE20, MIN, MAX, MEAN, MEDIAN, STDEV, STEP
             FROM MANUFACT_HIST.FACT_LOT_TESTS
             WHERE BATCH IN (`;

  for (
    let index = 0;
    index < Math.ceil(Object.keys(req.body).length);
    index++
  ) {
    if (index == 0) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ") AND TESTED_PARAMETR IN (";

  contador = Math.ceil(Object.keys(req.body).length);

  for (let index = contador; index < batch.length; index++) {
    if (index == contador) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ")";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("REPSALPROD_RM").then((results) =>
    RepmesTables.connectionRepmes(results, "REPSALPROD").then((results) => {
      results.getConnection().then((oracleDbConnection) => {
        oracleDbConnection
          .execute(sql, batch)
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
  );
};

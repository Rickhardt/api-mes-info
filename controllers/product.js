//third-party packages
const { validationResult } = require("express-validator");

//Custom References
const RepmesTables = require("../util/database");
let product;
let sql = "";

//Atributos de un producto. Solo se retorna información si existe una versión activa.
exports.getProductAttributes = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE: "Atributos del producto.",
  };

  product = [];

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "Para obtener resultados debe enviar al menos 1 PRODUCTO en el cuerpo de la petición.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        product.push(req.body[index]["PRODUCTO"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  sql = `SELECT A.NAME, C.REVISION, C.OWNER, F.NAME ATTRIBUTE_NAME, F.DESCRIPTION, E.MAGNITUDE
         FROM FW_PROD.FWPRODUCT A
         INNER JOIN FW_PROD.FWPRODUCT_N2M B ON B.FROMID = A.SYSID
         INNER JOIN FW_PROD.FWPRODUCTVERSION C ON C.SYSID = B.TOID
         INNER JOIN FW_PROD.FWPRODUCTVERSION_N2M D ON D.FROMID = C.SYSID
         INNER JOIN FW_PROD.FWPRPATTRIBUTEINSTANCE E ON E.SYSID = D.TOID
         INNER JOIN FW_PROD.FWPRPATTRIBUTE F ON F.SYSID = E.ATTRCLASS
         WHERE A.NAME IN (`;

  for (let index = 0; index < product.length; index++) {
    if (index == 0) {
      sql += ":v" + index.toString();
    } else {
      sql += ", :v" + index.toString();
    }
  }

  sql += ") AND C.REVSTATE = 'Active'";

  //Ejecutando consulta en la base de datos
  RepmesTables.credentialResults("MESSALPROD").then((results) =>
    RepmesTables.connectionRepmes(results, "MESSALPROD")
      .then((results) => {
        results.getConnection().then((oracleDbConnection) => {
          oracleDbConnection
            .execute(sql, product)
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
          MENSAJE:
            "Existió un error al ejecutar la consulta. Verifique el mensaje adicional en esta respuesta para más detalles",
          ERRORES: error.array(),
        });
      })
  );
};

//Process plans asociados a un producto. Solo se retorna información si existe una versión activa del producto.
exports.getProcessPlans = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE: "Atributos del producto.",
  };

  product = [];

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
          "Para obtener resultados debe enviar al menos 1 PRODUCTO en el cuerpo de la petición.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        product.push(req.body[index]["PRODUCTO"]);
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
         SELECT A.NAME AS PART_TYPE, H.MAGNITUDE AS OLD_PART_TYPE, C.OWNER, G.REVISION, G.PROCESSPLANNAME
         FROM FW_PROD.FWPRODUCT A
         INNER JOIN FW_PROD.FWPRODUCT_N2M B ON B.FROMID = A.SYSID
         INNER JOIN FW_PROD.FWPRODUCTVERSION C ON C.SYSID = B.TOID
         INNER JOIN FW_PROD.FWPRODUCTVERSION_N2M D ON D.FROMID = C.SYSID AND D.LINKNAME = 'processes'
         INNER JOIN FW_PROD.FWPROCESSPLAN E ON E.SYSID = D.TOID
         INNER JOIN FW_PROD.FWPROCESSPLAN_N2M F ON F.FROMID = E.SYSID
         INNER JOIN FW_PROD.FWPROCESSPLANVERSION G ON G.SYSID = F.TOID
         LEFT JOIN PART_NBR_OLD H ON H.PRODUCTNAME = A.NAME
         WHERE C.REVSTATE = 'Active' AND G.REVSTATE = 'Active' AND A.NAME IN (`;

  for (let index = 0; index < product.length; index++) {
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
            .execute(sql, product)
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
          MENSAJE:
            "Existió un error al ejecutar la consulta. Verifique el mensaje adicional en esta respuesta para más detalles",
          ERRORES: error.array(),
        });
      })
  );
};

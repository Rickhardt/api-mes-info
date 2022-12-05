//third-party packages
const { validationResult } = require("express-validator");

//Custom References
const RepmesTables = require("../util/database");
let equipment;
let sql = "";

//Atributos de un equipo. Solo se retorna información si existe una versión activa.
exports.getEquipmentAttributes = (req, res, next) => {
  const errors = validationResult(req);
  sql = "";

  if (!errors.isEmpty()) {
    return res.json({
      ERRORES: errors.array(),
    });
  }

  let responseToSend = {
    MENSAJE: "Atributos del equipo.",
  };

  equipment = [];

  switch (Object.keys(req.body).length) {
    case 0:
      return res.status(422).json({
        MENSAJE:
          "Para obtener resultados debe enviar al menos 1 EQUIPO en el cuerpo de la petición.",
      });
      break;
    default:
      Object.keys(req.body).forEach((index) => {
        equipment.push(req.body[index]["EQUIPO"]);
      });
      break;
  }

  //Formando la sentencia para número desconocido de valores
  sql = `SELECT N.EQUIPMENTNAME, C.OWNER, C.DESCRIPTION, N.STATE, N.STEPID, N.CAPABILITY,
                N.CAPACITY, N.USERNAME, N.LOTNAME, N.EQPTYPE, O.KEYDATA AS ATTRIBUTE_NAME,
                O.VALDATA AS ATTRIBUTE_VALUE
         FROM FW_PROD.FWEQPEQUIPMENT A
         INNER JOIN FW_PROD.FWEQPCURRENTSTATE N ON N.SYSID = A.CURRENTSTATE
         INNER JOIN FW_PROD.FWEQPCURRENTSTATE_PN2M O ON O.FROMID = N.SYSID
         INNER JOIN FW_PROD.FWEQPEQUIPMENT_N2M B ON B.FROMID = A.SYSID
         INNER JOIN FW_PROD.FWEQPEQUIPMENTVERSION C ON C.SYSID = B.TOID
         INNER JOIN FW_PROD.FWEQPTYPE D ON D.SYSID = C.EQPTYPE
         WHERE C.REVSTATE = 'Active' AND A.NAME IN (`;

  for (let index = 0; index < equipment.length; index++) {
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
            .execute(sql, equipment)
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

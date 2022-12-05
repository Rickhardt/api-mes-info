//third-party packages
const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

//Custom references
const Credentials = require("../models/credentials-table");

exports.credentialResults = (tableToQuery) => {
  return new Promise((resolve, reject) => {
    Credentials.findAll({
      attributes: ["USER", "PASSWORD"],
      where: {
        DB: tableToQuery,
      },
    })
      .then((credentials) => resolve(credentials))
      .catch((err) => reject(err));
  });
};

exports.connectionRepmes = (credentials, tableName) => {
  return new Promise((resolve, reject) => {
    oracledb
      .createPool({
        user: credentials[0]["dataValues"]["USER"].toString(),
        password: credentials[0]["dataValues"]["PASSWORD"].toString(),
        connectString: "10.0.50.7:1521/" + tableName,
      })
      .then((connection) => resolve(connection))
      .catch((err) => reject(err));
  });
};

exports.connectionMes = (credentials, tableName) => {
  return new Promise((resolve, reject) => {
    try {
      oracledb
        .createPool({
          user: credentials[0]["dataValues"]["USER"].toString(),
          password: credentials[0]["dataValues"]["PASSWORD"].toString(),
          connectString: "10.0.50.7:1521/" + tableName,
        })
        .then((connection) => resolve(connection))
        .catch((err) => reject(err));
    } catch (error) {
      return new Promise((resolve, reject) => {
        resolve(error);
      });
    }
  });
};

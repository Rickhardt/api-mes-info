//third-party packages
const sequelizeRef = require("sequelize");
const sequelize = require("../util/mysql-database");

const Credentials = sequelize.define(
  "credenciales",
  {
    ID: {
      type: sequelizeRef.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    USER: {
      type: sequelizeRef.STRING,
      allowNull: false,
    },
    PASSWORD: {
      type: sequelizeRef.STRING,
      allowNull: false,
    },
    DB: {
      type: sequelizeRef.STRING,
      allowNull: false,
    },
  },
  {
    // options
    sequelize,
    modelName: "Credentials",
    tableName: "credenciales",
    createdAt: "date_created",
    underscore: true,
    timestamps: false,
  }
);

module.exports = Credentials;

//third-party packages
const sequelizeRef = require("sequelize");

const sequelize = new sequelizeRef("credentials", "Ricardo_T", "tegodesing", {
  dialect: "mysql",
  host: "10.0.51.191",
});

module.exports = sequelize;

//Native Nodejs modules
const path = require("path");

exports.getIndex = (req, res, next) => {
  res.render("api-info/api-info", {
    pageTitle: "Información de la API",
  });
};

exports.getLotMethodExplanation = (req, res, next) => {
  res.render("api-info/api-info-lotes", {
    pageTitle: "Métodos relacionados con lotes",
  });
};

exports.getMiscMethodExplanation = (req, res, next) => {
  res.render("api-info/api-info-misc", {
    pageTitle: "Métodos misceláneos",
  });
};

//third-party packages
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

//Custom references
const repmesRoutes = require("./routes/repmes");
const mesRoutes = require("./routes/mesprod");
const errorController = require("./controllers/404");

const app = express();
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/repmes", repmesRoutes);
app.use("/mes", mesRoutes);
app.use(errorController.get404);

app.listen(2000);

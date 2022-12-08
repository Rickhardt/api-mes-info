//Native Nodejs modules
const path = require("path");
const https = require("https");

//third-party packages
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");

//Custom references
const repmesRoutes = require("./routes/repmes");
const mesRoutes = require("./routes/mesprod");
const otherRoutes = require("./routes/others");
const errorController = require("./controllers/404");

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

const app = express();
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);

app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);

app.use("/img", express.static(path.join(__dirname, "img")));

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
app.use(otherRoutes);
app.use(errorController.get404);

https.createServer({ key: privateKey, cert: certificate }, app).listen(2000);

// @ts-nocheck
require("dotenv").config();
const express = require("express");
const paginate = require("express-paginate");
const cors = require("cors");
const path = require("path");

const app = express();

var allowlist = process.env.CORS_WHITELIST.split(",");
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) != -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = {
      origin: false,
    }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use(cors(corsOptionsDelegate));
app.use("/uploads", express.static(path.join(__dirname, "/public/uploads/")));
app.use(paginate.middleware(10, 50));

// parse requests of content-type - application/json
app.use(express.json({ limit: "50mb" }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const db = require("./app/models");
db.sequelize.sync();
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Web Jasamarga API." });
});

app.get("/author", (req, res) => {
  res.json({
    name: "Widodo Pangestu",
    email: "wid.pangestu@gmail.com",
    github: "https://github.com/widodopangestu",
  });
});

require("./app/auth/auth");

require("./app/routes/public.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/profile.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/role.routes")(app);
require("./app/routes/baner.routes")(app);
require("./app/routes/pejabat.routes")(app);
require("./app/routes/penghargaan.routes")(app);
require("./app/routes/dokumen.routes")(app);
require("./app/routes/presskit.routes")(app);
require("./app/routes/asean.routes")(app);
require("./app/routes/kantor.routes")(app);
require("./app/routes/kontak.routes")(app);
require("./app/routes/page.routes")(app);
require("./app/routes/gallery.routes")(app);
require("./app/routes/post.routes")(app);
require("./app/routes/photo.routes")(app);
require("./app/routes/simpangsusun.routes")(app);
require("./app/routes/arearest.routes")(app);
require("./app/routes/info.routes")(app);
require("./app/routes/tcd.routes")(app);
require("./app/routes/rest_area.routes")(app);
require("./app/routes/residential.routes")(app);
require("./app/routes/status_tol.routes")(app);
require("./app/routes/alamat_tol.routes")(app);
require("./app/routes/topup_tol.routes")(app);
require("./app/routes/pencarian.routes")(app);
var upload = require("./upload.js");
app.post("/upload", upload);

app.use(function (err, req, res, next) {
  console.error("dari midleware", err.stack);
  res.status(500).send({
    message: err.message || "Some error occurred!",
  });
});
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

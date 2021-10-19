module.exports = (app) => {
  const passport = require("passport");
  const infografis = require("../controllers/public/infografis.controller.js");
  const pejabat = require("../controllers/public/pejabat.controller.js");
  const penghargaan = require("../controllers/public/penghargaan.controller.js");
  const dokumen = require("../controllers/public/dokumen.controller.js");
  const asean = require("../controllers/public/asean.controller.js");
  const kantor = require("../controllers/public/kantor.controller.js");
  const artikel = require("../controllers/public/artikel.controller.js");
  var router = require("express").Router();

  // Retrieve all infografis
  router.get("/infografis/:tipe", infografis.findAll);
  // Retrieve infografis
  router.get("/infografis/:tipe/:id", infografis.findOne);

  // Retrieve all pejabat
  router.get("/pejabat/:tipe", pejabat.findAll);
  // Retrieve pejabat
  router.get("/pejabat/:tipe/:uuid", pejabat.findOne);

  // Retrieve all penghargaan
  router.get("/penghargaan", penghargaan.findAll);
  // Retrieve penghargaan
  router.get("/penghargaan/:uuid", penghargaan.findOne);

  // Retrieve all dokumen
  router.get("/dokumen/:tipe", dokumen.findAll);
  // Retrieve dokumen
  router.get("/dokumen/:tipe/:id", dokumen.findOne);

  // Retrieve all asean
  router.get("/asean", asean.findAll);
  // Retrieve asean
  router.get("/asean/:uuid", asean.findByPk);

  // Retrieve all kantor
  router.get("/kantor", kantor.findAll);
  // Retrieve kantor
  router.get("/kantor/:uuid", kantor.findByPk);

  // Retrieve all artikel
  router.get("/artikel/:tipe", artikel.findAll);
  // Retrieve artikel
  router.get("/artikel/:tipe/:slug", artikel.findBySlug);

  app.use("/api/public", router);
};

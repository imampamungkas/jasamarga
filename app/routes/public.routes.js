//@ts-check
module.exports = (app) => {
  const baner = require("../controllers/public/baner.controller.js");
  const pejabat = require("../controllers/public/pejabat.controller.js");
  const penghargaan = require("../controllers/public/penghargaan.controller.js");
  const dokumen = require("../controllers/public/dokumen.controller.js");
  const presskit = require("../controllers/public/presskit.controller.js");
  const asean = require("../controllers/public/asean.controller.js");
  const kantor = require("../controllers/public/kantor.controller.js");
  const post = require("../controllers/public/post.controller.js");
  const kontak = require("../controllers/public/kontak.controller.js");
  const page = require("../controllers/public/page.controller.js");
  const travoy = require("../controllers/public/travoy.controller.js");
  var router = require("express").Router();

  // Retrieve all baner
  router.get("/baner/:tipe", baner.findAll);
  // Retrieve baner
  router.get("/baner/:tipe/:uuid", baner.findOne);

  // Retrieve all pejabat
  router.get("/pejabat/:tipe", pejabat.findAll);
  // Retrieve pejabat
  router.get("/pejabat/:tipe/:uuid", pejabat.findOne);

  // Retrieve all penghargaan
  router.get("/penghargaan", penghargaan.findAll);
  // Retrieve penghargaan
  router.get("/penghargaan/:uuid", penghargaan.findOne);

  // Retrieve all presskit
  router.get("/presskit", presskit.findAll);
  // Retrieve presskit
  router.get("/presskit/:uuid", presskit.findOne);

  // Retrieve all dokumen
  router.get("/dokumen/:tipe", dokumen.findAll);
  // Retrieve dokumen
  router.get("/dokumen/:tipe/:uuid", dokumen.findOne);

  // Retrieve all asean
  router.get("/asean", asean.findAll);
  // Retrieve asean
  router.get("/asean/:uuid", asean.findByPk);

  // Retrieve all kantor
  router.get("/kantor", kantor.findAll);
  // Retrieve kantor
  router.get("/kantor/:uuid", kantor.findByPk);

  // Retrieve all post
  router.get("/post/:tipe", post.findAll);
  // Retrieve post
  router.get("/post/:tipe/:uuid", post.findOne);

  // Retrieve page
  router.get("/page/:slug", page.findOne);

  // Create a new kontak
  router.post("/kontak", kontak.validate("createKontak"), kontak.create);


  // Retrieve all asal
  router.get("/travoy/asal", travoy.findAsal);

  // Retrieve all tujuan
  router.get("/travoy/tujuan", travoy.findTujuan);

  // Retrieve tarif
  router.get("/travoy/tarif", travoy.findTarif);

  app.use("/api/public", router);
};

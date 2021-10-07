module.exports = (app) => {
  const passport = require("passport");
  const artikel = require("../controllers/artikel.controller.js");
  const gambar = require("../controllers/gambar.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new artikel
  router.post("/:tipe", artikel.validate("createArtikel"), artikel.create);

  // Retrieve all artikel
  router.get("/:tipe", artikel.findAll);

  // Retrieve a single artikel with uuid
  router.get("/:tipe/:uuid", artikel.findOne);

  // Update a artikel with uuid
  router.put("/:tipe/:uuid", artikel.validate("updateArtikel"), artikel.update);

  // Delete a artikel with uuid
  router.delete("/:tipe/:uuid", artikel.delete);

  // Delete all artikel
  router.delete("/:tipe", artikel.deleteAll);

  // Create a new artikel gambar
  router.post("/:tipe/:uuid/gambar", gambar.validate("createGambar"), gambar.create);

  // Update a artikel gambar with id
  router.put("/:tipe/:uuid/gambar", gambar.updateBulk);

  // Delete a artikel gambar with id
  router.delete("/:tipe/gambar/:uuid", gambar.delete);

  app.use(
    "/api/artikel",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

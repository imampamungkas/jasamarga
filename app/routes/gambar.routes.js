module.exports = (app) => {
  const passport = require("passport");
  const gambar = require("../controllers/gambar.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();
  // Create a new artikel gambar
  router.post("/", gambar.validate("createGambar"), gambar.create);

  // Update a artikel gambar with id
  router.put("/:artikelUuid", gambar.updateBulk);

  // Delete a artikel gambar with id
  router.delete("/:uuid", gambar.delete);

  app.use(
    "/api/gambar",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const dokumen = require("../controllers/dokumen.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Dokumen
  router.post("/:tipe", dokumen.validate("createDokumen"), dokumen.create);

  // Retrieve all Dokumen
  router.get("/:tipe", dokumen.findAll);

  // Retrieve a single Dokumen with uuid
  router.get("/:tipe/:uuid", dokumen.findOne);

  // Update a Dokumen with uuid
  router.put("/:tipe/:uuid", dokumen.validate("updateDokumen"), dokumen.update);

  // Delete a Dokumen with uuid
  router.delete("/:tipe/:uuid", dokumen.delete);

  // Delete all Dokumen
  router.delete("/:tipe/", dokumen.deleteAll);

  app.use(
    "/api/dokumen",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

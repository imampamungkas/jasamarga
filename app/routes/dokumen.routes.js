module.exports = (app) => {
  const passport = require("passport");
  const dokumen = require("../controllers/dokumen.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new dokumen
  router.post("/:tipe", dokumen.validate("createDokumen"), dokumen.create);

  // Retrieve all dokumen
  router.get("/:tipe", dokumen.findAll);

  // Retrieve a single dokumen with id
  router.get("/:tipe/:id", dokumen.findOne);

  // Update a dokumen with id
  router.put("/:tipe/:id", dokumen.validate("updateDokumen"), dokumen.update);

  // Update a dokumen with id
  router.put("/:tipe", dokumen.updateBulk);

  // Delete a dokumen with id
  router.delete("/:tipe/:id", dokumen.delete);

  // Delete all dokumen
  router.delete("/:tipe", dokumen.deleteAll);

  app.use(
    "/api/dokumen",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

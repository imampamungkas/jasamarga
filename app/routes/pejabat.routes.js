module.exports = (app) => {
  const passport = require("passport");
  const pejabat = require("../controllers/pejabat.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Pejabat
  router.post("/:tipe", pejabat.validate("createPejabat"), pejabat.create);

  // Retrieve all Pejabat
  router.get("/:tipe", pejabat.findAll);

  // Retrieve a single Pejabat with id
  router.get("/:tipe/:id", pejabat.findOne);

  // Update a Pejabat with id
  router.put("/:tipe/:id", pejabat.validate("updatePejabat"), pejabat.update);

  // Update a Pejabat with id
  router.put("/:tipe", pejabat.updateBulk);

  // Delete a Pejabat with id
  router.delete("/:tipe/:id", pejabat.delete);

  // Delete all Pejabat
  router.delete("/:tipe", pejabat.deleteAll);

  app.use(
    "/api/pejabat",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

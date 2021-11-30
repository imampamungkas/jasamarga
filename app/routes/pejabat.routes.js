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

  // Retrieve a single Pejabat with uuid
  router.get("/:tipe/:uuid", pejabat.findOne);

  // Update a Pejabat with uuid
  router.put("/:tipe/:uuid", pejabat.validate("updatePejabat"), pejabat.update);

  // Update a Pejabat with uuid
  router.put("/:tipe", pejabat.updateBulk);

  // Delete a Pejabat with uuid
  router.delete("/:tipe/:uuid", pejabat.delete);

  // Delete all Pejabat
  router.delete("/:tipe", pejabat.deleteAll);

  app.use(
    "/api/pejabat",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

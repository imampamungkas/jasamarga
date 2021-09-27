module.exports = (app) => {
  const passport = require("passport");
  const infografis = require("../controllers/infografis.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Infografis
  router.post("/:tipe", infografis.validate("createInfografis"), infografis.create);

  // Retrieve all Infografis
  router.get("/:tipe", infografis.findAll);
  
  // Retrieve a single Infografis with id
  router.get("/:tipe/:id", infografis.findOne);

  // Update a Infografis with id
  router.put("/:tipe/:id", infografis.validate("updateInfografis"), infografis.update);

  // Update a Infografis with id
  router.put("/:tipe/", infografis.updateBulk);

  // Delete a Infografis with id
  router.delete("/:tipe/:id", infografis.delete);

  // Delete all Infografis
  router.delete("/:tipe/", infografis.deleteAll);

  app.use(
    "/api/infografis",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

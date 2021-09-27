module.exports = (app) => {
  const passport = require("passport");
  const asean = require("../controllers/asean.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new asean
  router.post("/", asean.validate("createAsean"), asean.create);

  // Retrieve all asean
  router.get("/", asean.findAll);

  // Retrieve a single asean with id
  router.get("/:id", asean.findOne);

  // Update a asean with id
  router.put("/:id", asean.validate("updateAsean"), asean.update);

  // Update a asean with id
  router.put("/", asean.updateBulk);

  // Delete a asean with id
  router.delete("/:id", asean.delete);

  // Delete all asean
  router.delete("/", asean.deleteAll);

  app.use(
    "/api/asean",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

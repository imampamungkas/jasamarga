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

  // Retrieve a single asean with uuid
  router.get("/:uuid", asean.findOne);

  // Update a asean with uuid
  router.put("/:uuid", asean.validate("updateAsean"), asean.update);

  // Delete a asean with uuid
  router.delete("/:uuid", asean.delete);

  // Delete all asean
  router.delete("/", asean.deleteAll);

  app.use(
    "/api/asean",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

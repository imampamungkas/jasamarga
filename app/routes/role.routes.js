module.exports = (app) => {
  const passport = require("passport");
  const role = require("../controllers/role.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new role
  router.post("/", role.validate("createRole"), role.create);

  // Retrieve all role
  router.get("/", role.findAll);

  // Retrieve a single role with nama
  router.get("/:nama", role.findOne);

  // Update a role with nama
  router.put("/:nama", role.validate("updateRole"), role.update);

  // Delete a role with nama
  router.delete("/:nama", role.delete);

  // Delete all role
  router.delete("/", role.deleteAll);

  app.use(
    "/api/role",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

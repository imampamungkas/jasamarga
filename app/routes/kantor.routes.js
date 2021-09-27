module.exports = (app) => {
  const passport = require("passport");
  const kantor = require("../controllers/kantor.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new kantor
  router.post("/", kantor.validate("createKantor"), kantor.create);

  // Retrieve all kantor
  router.get("/", kantor.findAll);

  // Retrieve a single kantor with id
  router.get("/:id", kantor.findOne);

  // Update a kantor with id
  router.put("/:id", kantor.validate("updateKantor"), kantor.update);

  // Update a kantor with id
  router.put("/", kantor.updateBulk);

  // Delete a kantor with id
  router.delete("/:id", kantor.delete);

  // Delete all kantor
  router.delete("/", kantor.deleteAll);

  app.use(
    "/api/kantor",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

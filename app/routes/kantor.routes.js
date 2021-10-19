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

  // Retrieve a single kantor with uuid
  router.get("/:uuid", kantor.findOne);

  // Update a kantor with uuid
  router.put("/:uuid", kantor.validate("updateKantor"), kantor.update);

  // Update a kantor with uuid
  router.put("/", kantor.updateBulk);

  // Delete a kantor with uuid
  router.delete("/:uuid", kantor.delete);

  // Delete all kantor
  router.delete("/", kantor.deleteAll);

  app.use(
    "/api/kantor",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

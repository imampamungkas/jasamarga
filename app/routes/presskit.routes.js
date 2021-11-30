//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const presskit = require("../controllers/presskit.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Presskit
  router.post("/", presskit.validate("createPresskit"), presskit.create);

  // Create a new Presskit
  router.post("/form", presskit.validate("createPresskit"), presskit.create_form);

  // Retrieve all Presskit
  router.get("/", presskit.findAll);

  // Retrieve a single Presskit with uuid
  router.get("/:uuid", presskit.findOne);

  // Update a Presskit with uuid
  router.put("/:uuid", presskit.validate("updatePresskit"), presskit.update);

  // Update a Presskit with uuid
  router.put("/form/:uuid", presskit.validate("updatePresskit"), presskit.update_form);

  // Delete a Presskit with uuid
  router.delete("/:uuid", presskit.delete);

  // Delete all Presskit
  router.delete("/", presskit.deleteAll);

  app.use(
    "/api/presskit",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

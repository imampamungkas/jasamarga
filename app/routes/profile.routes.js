module.exports = (app) => {
  const passport = require("passport");
  const profiles = require("../controllers/profile.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Retrieve all Tutorials
  router.get("/", profiles.findOne);

  // Update a Tutorial with id
  router.put("/", profiles.update);
  // Update a Tutorial with id
  router.put("/password", profiles.updatePassword);

  app.use(
    "/api/profile",
    passport.authenticate("jwt", { session: false }),
    router
  );
};

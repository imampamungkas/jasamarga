//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const kontak = require("../controllers/kontak.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Retrieve all kontak
  router.get("/", kontak.findAll);

  // Retrieve a single kontak with id
  router.get("/:id", kontak.findOne);

  // Delete a kontak with id
  router.delete("/:id", kontak.delete);

  // Delete all kontak
  router.delete("/", kontak.deleteAll);

  app.use(
    "/api/kontak",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

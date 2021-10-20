//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const gallery = require("../controllers/gallery.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Gallery
  router.post("/:pageSlug", gallery.validate("createGallery"), gallery.create);

  // Update a Gallery with uuid
  router.put("/:pageSlug/:uuid", gallery.validate("updateGallery"), gallery.update);

  // Update a Gallery with uuid
  router.put("/:pageSlug/", gallery.updateBulk);

  // Delete a Gallery with uuid
  router.delete("/:pageSlug/:uuid", gallery.delete);

  app.use(
    "/api/gallery",
    passport.authenticate("jwt", { session: false }),
    authorize([Role.Admin]),
    router
  );
};

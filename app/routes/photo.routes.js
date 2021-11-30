//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const photo = require("../controllers/photo.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Photo
  router.post("/:postUuid", photo.validate("createPhoto"), photo.create);

  // Update a Photo with uuid
  router.put("/:postUuid/:uuid", photo.validate("updatePhoto"), photo.update);

  // Update a Photo with uuid
  router.put("/:postUuid/", photo.updateBulk);

  // Delete a Photo with uuid
  router.delete("/:postUuid/:uuid", photo.delete);

  app.use(
    "/api/photo",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const arearest = require("../controllers/arearest.controller");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Photo
  router.post("/:postUuid", arearest.validate("createPhoto"), arearest.create);

  // Update a Photo with uuid
  router.put("/:postUuid/:uuid", arearest.validate("updatePhoto"), arearest.update);

  // Update a Photo with uuid
  router.put("/:postUuid/", arearest.updateBulk);

  // Delete a Photo with uuid
  router.delete("/:postUuid/:uuid", arearest.delete);

  app.use(
    "/api/arearest",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

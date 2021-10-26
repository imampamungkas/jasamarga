//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const info = require("../controllers/info.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Info
  router.post("/:postUuid", info.validate("createInfo"), info.create);

  // Update a Info with uuid
  router.put("/:postUuid/:uuid", info.validate("updateInfo"), info.update);

  // Update a Info with uuid
  router.put("/:postUuid/", info.updateBulk);

  // Delete a Info with uuid
  router.delete("/:postUuid/:uuid", info.delete);

  app.use(
    "/api/info",
    passport.authenticate("jwt", { session: false }),
    authorize([Role.Admin]),
    router
  );
};

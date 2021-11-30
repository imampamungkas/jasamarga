//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const residential = require("../controllers/residential.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Residential
  router.post("/:postUuid", residential.validate("createResidential"), residential.create);

  // Update a Residential with uuid
  router.put("/:postUuid/:uuid", residential.validate("updateResidential"), residential.update);

  // Update a Residential with uuid
  router.put("/:postUuid/", residential.updateBulk);

  // Delete a Residential with uuid
  router.delete("/:postUuid/:uuid", residential.delete);

  app.use(
    "/api/residential",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

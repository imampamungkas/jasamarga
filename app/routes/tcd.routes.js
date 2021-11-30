//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const tcd = require("../controllers/tcd.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Tcd
  router.post("/:postUuid", tcd.validate("createTcd"), tcd.create);

  // Update a Tcd with uuid
  router.put("/:postUuid/:uuid", tcd.validate("updateTcd"), tcd.update);

  // Update a Tcd with uuid
  router.put("/:postUuid/", tcd.updateBulk);

  // Delete a Tcd with uuid
  router.delete("/:postUuid/:uuid", tcd.delete);

  app.use(
    "/api/tcd",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const topup_tol = require("../controllers/topup_tol.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new StatusTol
  router.post("/:postUuid", topup_tol.validate("createTopupTol"), topup_tol.create);

  // Update a StatusTol with uuid
  router.put("/:postUuid/:uuid", topup_tol.validate("updateTopupTol"), topup_tol.update);

  // Update a StatusTol with uuid
  router.put("/:postUuid/", topup_tol.updateBulk);

  // Delete a StatusTol with uuid
  router.delete("/:postUuid/:uuid", topup_tol.delete);

  app.use(
    "/api/topup-tol",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

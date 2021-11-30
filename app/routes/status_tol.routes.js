//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const status_tol = require("../controllers/status_tol.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new StatusTol
  router.post("/:postUuid", status_tol.validate("createStatusTol"), status_tol.create);

  // Update a StatusTol with uuid
  router.put("/:postUuid/:uuid", status_tol.validate("updateStatusTol"), status_tol.update);

  // Update a StatusTol with uuid
  router.put("/:postUuid/", status_tol.updateBulk);

  // Delete a StatusTol with uuid
  router.delete("/:postUuid/:uuid", status_tol.delete);

  app.use(
    "/api/status-tol",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const alamat_tol = require("../controllers/alamat_tol.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new StatusTol
  router.post("/:postUuid", alamat_tol.validate("createAlamatTol"), alamat_tol.create);

  // Update a StatusTol with uuid
  router.put("/:postUuid/:uuid", alamat_tol.validate("updateAlamatTol"), alamat_tol.update);

  // Update a StatusTol with uuid
  router.put("/:postUuid/", alamat_tol.updateBulk);

  // Delete a StatusTol with uuid
  router.delete("/:postUuid/:uuid", alamat_tol.delete);

  app.use(
    "/api/alamat-tol",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

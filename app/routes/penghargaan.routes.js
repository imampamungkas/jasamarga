module.exports = (app) => {
  const passport = require("passport");
  const penghargaan = require("../controllers/penghargaan.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Penghargaan
  router.post(
    "/",
    penghargaan.validate("createPenghargaan"),
    penghargaan.create
  );

  // Retrieve all Penghargaan
  router.get("/", penghargaan.findAll);

  // Retrieve a single Penghargaan with uuid
  router.get("/:uuid", penghargaan.findOne);

  // Update a Penghargaan with uuid
  router.put(
    "/:uuid",
    penghargaan.validate("updatePenghargaan"),
    penghargaan.update
  );

  // Update a Penghargaan with uuid
  router.put("/", penghargaan.updateBulk);

  // Delete a Penghargaan with uuid
  router.delete("/:uuid", penghargaan.delete);

  // Delete all Penghargaan
  router.delete("/", penghargaan.deleteAll);

  app.use(
    "/api/penghargaan",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

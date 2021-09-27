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

  // Retrieve a single Penghargaan with id
  router.get("/:id", penghargaan.findOne);

  // Update a Penghargaan with id
  router.put(
    "/:id",
    penghargaan.validate("updatePenghargaan"),
    penghargaan.update
  );

  // Update a Penghargaan with id
  router.put("/", penghargaan.updateBulk);

  // Delete a Penghargaan with id
  router.delete("/:id", penghargaan.delete);

  // Delete all Penghargaan
  router.delete("/", penghargaan.deleteAll);

  app.use(
    "/api/penghargaan",
    passport.authenticate("jwt", { session: false }),
    authorize(Role.Admin),
    router
  );
};

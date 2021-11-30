module.exports = (app) => {
  const passport = require("passport");
  const pencarian = require("../controllers/pencarian.controller.js");
  // const authorize = require("../helpers/authorize");
  // const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new pencarian
  router.post("/", pencarian.validate("createPencarian"), pencarian.create);

  // Retrieve all pencarian
  router.get("/", pencarian.findAll);

  // Retrieve a single pencarian with uuid
  router.get("/:uuid", pencarian.findOne);

  // Update a pencarian with uuid
  router.put("/:uuid", pencarian.validate("updatePencarian"), pencarian.update);

  // Delete a pencarian with uuid
  router.delete("/:uuid", pencarian.delete);

  // Delete all pencarian
  router.delete("/", pencarian.deleteAll);

  app.use(
    "/api/pencarian",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

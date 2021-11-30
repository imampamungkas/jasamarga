//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const baner = require("../controllers/baner.controller.js");
  // const authorize = require("../helpers/authorize");
  // const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Baner
  router.post("/:tipe", baner.validate("createBaner"), baner.create);

  // Retrieve all Baner
  router.get("/:tipe", baner.findAll);

  // Retrieve a single Baner with uuid
  router.get("/:tipe/:uuid", baner.findOne);

  // Update a Baner with uuid
  router.put("/:tipe/:uuid", baner.validate("updateBaner"), baner.update);

  // Update a Baner with uuid
  router.put("/:tipe/", baner.updateBulk);

  // Delete a Baner with uuid
  router.delete("/:tipe/:uuid", baner.delete);

  // Delete all Baner
  router.delete("/:tipe/", baner.deleteAll);

  app.use(
    "/api/baner",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

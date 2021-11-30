//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const page = require("../controllers/page.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Retrieve a single Page with uuid
  router.get("/:slug", page.findOne);

  // Update a Page with uuid
  router.put("/:slug", page.update);


  app.use(
    "/api/page",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const rest_area = require("../controllers/rest_area.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new RestArea
  router.post("/:postUuid", rest_area.validate("createRestArea"), rest_area.create);

  // Update a RestArea with uuid
  router.put("/:postUuid/:uuid", rest_area.validate("updateRestArea"), rest_area.update);

  // Update a RestArea with uuid
  router.put("/:postUuid/", rest_area.updateBulk);

  // Delete a RestArea with uuid
  router.delete("/:postUuid/:uuid", rest_area.delete);

  app.use(
    "/api/rest-area",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

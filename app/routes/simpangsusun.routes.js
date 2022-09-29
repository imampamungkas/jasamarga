//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const simpangsusun = require("../controllers/simpangsusun.controller");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Photo
  router.post("/:postUuid", simpangsusun.validate("createPhoto"), simpangsusun.create);

  // Update a Photo with uuid
  router.put("/:postUuid/:uuid", simpangsusun.validate("updatePhoto"), simpangsusun.update);

  // Update a Photo with uuid
  router.put("/:postUuid/", simpangsusun.updateBulk);

  // Delete a Photo with uuid
  router.delete("/:postUuid/:uuid", simpangsusun.delete);

  app.use(
    "/api/simpangsusun",
    passport.authenticate("jwt", { session: false }),
    // authorize([Role.Admin]),
    router
  );
};

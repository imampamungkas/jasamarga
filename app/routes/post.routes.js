//@ts-check
module.exports = (app) => {
  const passport = require("passport");
  const post = require("../controllers/post.controller.js");
  const authorize = require("../helpers/authorize");
  const Role = require("../helpers/role");

  var router = require("express").Router();

  // Create a new Post
  router.post("/:tipe", post.validate("createPost"), post.create);

  // Retrieve all Post
  router.get("/:tipe", post.findAll);

  // Retrieve a single Post with uuid
  router.get("/:tipe/:uuid", post.findOne);

  // Update a Post with uuid
  router.put("/:tipe/:uuid", post.validate("updatePost"), post.update);

  // Update a Post with uuid
  router.put("/:tipe/", post.updateBulk);

  // Delete a Post with uuid
  router.delete("/:tipe/:uuid", post.delete);

  // Delete all Post
  router.delete("/:tipe/", post.deleteAll);

  app.use(
    "/api/post",
    passport.authenticate("jwt", { session: false }),
    authorize([Role.Admin]),
    router
  );
};

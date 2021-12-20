module.exports = (app) => {
  const passport = require("passport");
  const jwt = require("jsonwebtoken");
  var router = require("express").Router();
  const db = require("../models");
  const RefreshToken = db.refresTokens;

  const auths = require("../controllers/auth.controller.js");
  const accessTokenSecret = process.env.JWT_SECRET;
  const refreshTokenSecret = process.env.JWT_SECRET;

  router.post("/signup", auths.validate("signup"), auths.signup);
  router.post("/forgot-password", auths.forgotPassword);
  router.post("/reset-password", auths.resetPassword);

  router.post("/login", async (req, res, next) => {
    passport.authenticate("login", async (err, user, info) => {
      try {
        if (err || !user) {
          const error = err ? err : new Error("An error occurred.");
          console.log("hshshsh", error.message);
          return next(error);
        }

        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);

          const body = {
            _id: user._id,
            email: user.email,
            roleName: user.role ? user.role.nama : null,
            id: user.id,
            username: user.username,
          };
          const accessToken = jwt.sign({ user: body }, accessTokenSecret, {
            expiresIn: "20m",
          });
          const refreshToken = jwt.sign({ user: body }, refreshTokenSecret);
          await RefreshToken.create({ token: refreshToken, userId: user.id });
          return res.json({
            accessToken,
            refreshToken,
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  });

  router.post("/refresh-token", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.sendStatus(401);
    }
    RefreshToken.findOne({
      where: { token: refreshToken },
    })
      .then((data) => {
        if (data == null) {
          return res.sendStatus(403);
        } else {
          jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
            if (err) {
              return res.sendStatus(403);
            }
            const body = user.user;
            const accessToken = jwt.sign({ user: body }, accessTokenSecret, {
              expiresIn: "20m",
            });

            res.json({
              accessToken,
            });
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: err,
        });
      });
  });
  router.post("/logout", (req, res) => {
    const { refreshToken } = req.body;
    RefreshToken.destroy({
      where: { token: refreshToken },
    })
      .then((num) => {
        if (num == 1) {
          res.send({
            message: "Logout successful!",
          });
        } else {
          res.send({
            message: "Logout failed!",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: err,
        });
      });
  });

  app.use("/api/auth", router);
};

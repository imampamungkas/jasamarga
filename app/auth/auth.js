const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const db = require("../models");
const User = db.users;
const Role = db.roles;
const { Op } = require("sequelize");

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          where: {
            [Op.or]: [{ email: email }, { username: email }],
            [Op.and]: [{ is_active: true }],
          },
          include: {
            model: Role,
            as: 'role',
          },
        });
        if (!user) {
          return done(new Error("Username/Password tidak sesuai."), false);
        }
        isValid = await user.isValidPassword(password);
        if (!isValid) {
          return done(new Error("Username/Password tidak sesuai.."), false);
        }
        if (user && !user.is_verified) {
          return done(new Error("Username/Password tidak sesuai."), false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

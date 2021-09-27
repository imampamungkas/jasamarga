const FileType = require("file-type");
const crypto = require("crypto");
const fs = require("fs");
const db = require("../models");
const User = db.users;
const Token = db.tokens;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { sendMailForgotPassword } = require("../emails/sendMailForgotPassword");

exports.validate = (method) => {
  switch (method) {
    case "signup": {
      return [
        body("nama_lengkap").exists(),
        body("alamat_lengkap").exists(),
        body("jenis_identitas").exists(),
        body("no_identitas").exists(),
        body("pekerjaan").exists(),
        body("email")
          .isEmail()
          .custom((value) => {
            return User.findOne({ where: { email: value } }).then((user) => {
              if (user) {
                return Promise.reject("E-mail already in use!");
              }
            });
          }),
        body("username").custom((value) => {
          return User.findOne({ where: { username: value } }).then((user) => {
            if (user) {
              return Promise.reject("Username already in use!");
            }
          });
        }),
        body("no_hp").custom((value) => {
          return User.findOne({ where: { no_hp: value } }).then((user) => {
            if (user) {
              return Promise.reject("No HP already in use!");
            }
          });
        }),
        body("password").exists(),
      ];
    }
  }
};
// Create and Save a new User
exports.signup = async (req, res) => {
  // Validate request
  const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  let file_name = null;
  if (req.body.hasOwnProperty("file_identitas")) {
    if (req.body.file_identitas) {
      const file_type = await FileType.fromBuffer(
        Buffer.from(req.body.file_identitas, "base64")
      );
      file_name = Math.floor(Date.now() / 1000) + "." + file_type.ext;
      let b = Buffer.from(req.body.file_identitas, "base64");
      fs.writeFile("public/uploads/" + file_name, b, function (err) {
        if (!err) {
          console.log("file is created");
        }
      });
    }
  }

  const user = {
    nama_lengkap: req.body.nama_lengkap,
    alamat_lengkap: req.body.alamat_lengkap,
    jenis_identitas: req.body.jenis_identitas,
    no_identitas: req.body.no_identitas,
    file_identitas: file_name,
    pekerjaan: req.body.pekerjaan,
    email: req.body.email,
    no_hp: req.body.no_hp,
    username: req.body.username,
    password: req.body.password,
    pekerjaan_lainnya: req.body.pekerjaan_lainnya,
  };
  // Save User in the database
  User.create(user)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  User.findOne({
    where: {
      [Op.or]: [{ email: email }, { username: email }],
    },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving User with email=" + email,
        });
      } else {
        const len = 64;
        const { nama_lengkap, username } = data;
        var token = crypto
          .randomBytes(Math.ceil(len / 2))
          .toString("hex") // convert to hexadecimal format
          .slice(0, len);
        Token.destroy({
          where: { userId: data.id },
        });
        const url_token = `${process.env.UI_URL}/reset-password?token=${token}&email=${email}`;
        var token_obj = Token.create({
          token: token,
          userId: data.id,
        }).then(async (data) => {
          sendMailForgotPassword({
            email: email,
            url_token: url_token,
            nama: nama_lengkap,
            username: username,
          });
        });
        res.send({
          url_token: url_token,
          message: `Token already sent to your ${email}, please check your inbox or spam folder!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with email=" + email,
      });
    });
};

exports.resetPassword = async (req, res) => {
  const { token, new_password, email } = req.body;
  const one_hour = new Date(Date.now() - 60 * 60 * 1000);
  Token.findOne({
    where: {
      [Op.and]: [
        {
          token: token,
          createdAt: { [Op.gt]: one_hour },
        },
      ],
    },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Token not found!",
        });
      } else {
        User.findOne({
          where: {
            [Op.or]: [{ email: email }, { username: email }],
          },
        }).then(async (data) => {
          if (data) {
            data.password = new_password;
            data.save();
            Token.destroy({
              where: { userId: data.id },
            });
            res.send({
              message: "Password was updated successfully.",
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error retrieving User with email=" + email,
      });
    });
};

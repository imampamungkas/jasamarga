const paginate = require("express-paginate");
const FileType = require("file-type");
const fs = require("fs");
const db = require("../models");
const User = db.users;
const Permohonan = db.permohonans;
const Keberatan = db.keberatans;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "updateUser": {
      return [
        // body("file_identitas").custom(async (value) => {
        //   if (!isBase64(value)) {
        //     return Promise.reject("File is not base 64 format!");
        //   }
        //   // const file_type = await FileType.fromBuffer(
        //   //   Buffer.from(value, "base64")
        //   // );
        //   // const allowed_file = ["png", "jpg", "jpeg"];
        //   // allowed_file.includes(file_type.ext);

        //   // console.log("file_type", file_type);
        //   // if (!allowed_file.includes(file_type.ext)) {
        //   //   return Promise.reject("File extension is not alowed!");
        //   // }
        // }),
        body("email")
          .isEmail()
          .custom((value) => {
            return User.findOne({ where: { email: value } }).then((user) => {
              if (user) {
                return Promise.reject("E-mail already in use!");
              }
            });
          }),
        body("password").exists(),
      ];
    }
    case "updatePassword": {
      return [
        body("old_password").exists(),
        body("new_password").exists(),
      ];
    }
  }
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.user.id;

  User.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Infografi with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};

// Update a User by the id in the request
exports.update = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.user.id;

  let user = req.body;
  delete user.is_verified;
  delete user.role;
  delete user.email;
  delete user.username;
  console.log(user);
  if (req.body.hasOwnProperty("file_identitas")) {
    if (req.body.file_identitas) {
      const file_type = await FileType.fromBuffer(
        Buffer.from(req.body.file_identitas, "base64")
      );
      let file_name = Math.floor(Date.now() / 1000) + "." + file_type.ext;
      let b = Buffer.from(req.body.file_identitas, "base64");
      fs.writeFile("public/uploads/" + file_name, b, function (err) {
        if (!err) {
          console.log("file is created");
        }
      });

      user["file_identitas"] = file_name;
    } else {
      delete user.file_identitas;
    }
  }
  User.update(user, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Update a User by the id in the request
exports.updatePassword = (req, res) => {
  const id = req.user.id;

  let { old_password, new_password } = req.body;

  User.findByPk(id)
    .then(async (user) => {
      if (user == null) {
        res.status(404).send({
          message: "Error retrieving User with id=" + id,
        });
      } else {
        isValid = await user.isValidPassword(old_password);
        if (!isValid) {
          res.status(400).send({
            message: "Wrong old Password!",
          });
        } else {
          user.password = new_password;
          user.save();
          res.send({
            message: "Success change password!",
          });
        }
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};
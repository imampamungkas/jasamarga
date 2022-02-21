const db = require("../models");
const User = db.users;
const Role = db.roles;
const Akses = db.akses;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "updateUser": {
      return [
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

  User.findOne({
    where: { id: id },
    include: {
      model: Role,
      as: 'role',
      include: [{
        model: Akses,
        as: 'akses_role',
      }],
    },
  })
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

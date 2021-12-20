const paginate = require("express-paginate");
const FileType = require("file-type");
const fs = require("fs");
const db = require("../models");
const User = db.users;
const Role = db.roles;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createUser": {
      return [
        body("nama_lengkap").exists(),
        // body("alamat_lengkap").exists(),
        // body("jenis_identitas").exists(),
        // body("no_identitas").exists(),
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
        // body("no_hp").custom((value) => {
        //   return User.findOne({ where: { no_hp: value } }).then((user) => {
        //     if (user) {
        //       return Promise.reject("No HP already in use!");
        //     }
        //   });
        // }),
        body("password").exists(),
        body("roleNama")
          .optional()
          .custom(async (value) => {
            const roles = await Role.findAll({ attributes: ['nama'] })
              .then(function (roles) {
                return roles.map(role => { return role.nama; })
              });
            if (!roles.includes(value)) {
              return Promise.reject("Role not found!");
            }
          }),
      ];
    }
    case "updateUser": {
      return [
        body("email")
          .optional()
          .isEmail()
          .custom((value) => {
            return User.findOne({ where: { email: value } }).then((user) => {
              if (user) {
                return Promise.reject("E-mail already in use!");
              }
            });
          }),
        body("roleNama")
          .optional()
          .custom(async (value) => {
            const roles = await Role.findAll({ attributes: ['nama'] })
              .then(function (roles) {
                return roles.map(role => { return role.nama; })
              });
            if (!roles.includes(value)) {
              return Promise.reject("Role not found!");
            }
            console.log('roles', roles);
          }),
      ];
    }
  }
};
// Create and Save a new User
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }


  const { file_identitas, ...user } = req.body;
  if (file_identitas != null) {
    const file_type = await FileType.fromBuffer(
      Buffer.from(file_identitas, "base64")
    );
    let file_name = `${Math.floor(Date.now() / 1000)}.${file_type.ext}`;
    let b = Buffer.from(file_identitas, "base64");
    fs.writeFile("public/uploads/" + file_name, b, function (err) {
      if (!err) {
        console.log("file is created");
      }
    });
    user["file_identitas"] = file_name;
  }

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

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const search = req.query.search;
  const is_verified = req.query.is_verified;
  const is_active = req.query.is_active;

  var condition = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { email: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } },
            { nama_lengkap: { [Op.like]: `%${search}%` } },
            { alamat_lengkap: { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      is_verified ? { is_verified: is_verified } : null,
      is_active ? { is_active: is_active } : null,
      {
        username: {
          [Op.not]: 'admin'
        }
      },
    ],
  };

  User.findAndCountAll({
    where: condition,
    limit: req.query.limit,
    offset: req.skip,
    order: [["createdAt", "DESC"]],
  })
    .then((results) => {
      const itemCount = results.count;
      const pageCount = Math.ceil(results.count / req.query.limit);
      res.send({
        results: results.rows,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

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
  const id = req.params.id;

  let user = req.body;
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
      console.log(err);
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};
// Update a User by the id in the request
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id;

  let { new_password } = req.body;
  User.findByPk(id)
    .then(async (data) => {
      if (data) {
        data.password = new_password;
        data.save();
        res.send({
          message: "Password was updated successfully.",
        });
      }
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all users.",
      });
    });
};

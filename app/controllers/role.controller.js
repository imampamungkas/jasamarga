const paginate = require("express-paginate");
const db = require("../models");
const Role = db.roles;
const Akses = db.akses;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createRole": {
      return [
        body("nama")
          .exists()
          .custom((value) => {
            return Role.findOne({ where: { nama: value } }).then((user) => {
              if (user) {
                return Promise.reject("Role Nama already in use!");
              }
            });
          }),
      ];
    }
    case "updateRole": {
      return [];
    }
  }
};
// Create and Save a new Role
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }


  const { akses, ...roles } = req.body;
  // Save Role in the database
  Role.create(roles)
    .then(async (data) => {
      if (akses instanceof Array && akses.length > 0) {
        for (var i = 0; i < akses.length; i++) {
          akses[i]["roleNama"] = data.nama;
          await Akses.create(akses[i]);
        }
        await data.reload({ include: 'akses_role' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Role.",
      });
    });
};

// Retrieve all Role from the database.
exports.findAll = (req, res) => {
  const nopage = req.query.nopage || 0;
  const search = req.query.search;

  var condition_akses =
    search
      ? {
        [Op.or]: [
          { '$akses_role.nama$': { [Op.like]: `%${search}%` } },
          { '$akses_role.url_link$': { [Op.like]: `%${search}%` } },
          { '$role.nama$': { [Op.like]: `%${search}%` } },
          { '$role.deskripsi$': { [Op.like]: `%${search}%` } },
        ],
      }
      : null;
  var query =
    nopage == 1
      ? Role.findAll({
        include: {
          model: Akses,
          as: 'akses_role',
          where: condition_akses,
        },
        order: [["createdAt", "DESC"]],
      })
      : Role.findAndCountAll({
        include: {
          model: Akses,
          as: 'akses_role',
          where: condition_akses,
        },
        limit: req.query.limit,
        offset: req.skip,
        order: [["createdAt", "DESC"]],
      });
  query
    .then((results) => {
      if (nopage == 1) {
        res.send(results);
      } else {
        const itemCount = results.count;
        const pageCount = Math.ceil(results.count / req.query.limit);
        res.send({
          results: results.rows,
          pageCount,
          itemCount,
          pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving roles.",
      });
    });
};

// Find a single Role with an nama
exports.findOne = (req, res) => {
  const nama = req.params.nama;

  Role.findOne({
    where: { nama: nama },
    include: {
      model: Akses,
      as: 'akses_role',
    },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Role with nama=" + nama,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Role with nama=" + nama,
      });
    });
};

// Update a Role by the nama in the request
exports.update = async (req, res) => {
  const nama = req.params.nama;
  const { akses, ...roles } = req.body;
  Role.findByPk(nama)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Role with nama=" + nama,
        });
      } else {
        data.update(roles);
        if (akses instanceof Array && akses.length > 0) {
          Akses.destroy({
            where: { roleNama: nama },
            truncate: false,
          })
          for (var i = 0; i < akses.length; i++) {
            akses[i]["roleNama"] = data.nama;
            await Akses.create(akses[i]);
          }
          await data.reload({ include: 'akses_role' });
        }
        res.send({
          message: "Role was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Role with nama=" + nama,
      });
    });
};

// Delete a Role with the specified nama in the request
exports.delete = (req, res) => {
  const nama = req.params.nama;

  Role.findByPk(nama)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Role with nama=" + nama,
        });
      } else {
        data.destroy();
        res.send({
          message: "Role was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Role with nama=" + nama,
      });
    });
};

// Delete all Role from the database.
exports.deleteAll = (req, res) => {
  Role.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Role were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all roles.",
      });
    });
};

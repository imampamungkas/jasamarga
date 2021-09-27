const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Kantor = db.kantor;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { timeStamp } = require("console");

exports.validate = (method) => {
  switch (method) {
    case "createKantor": {
      return [
        body("tipe").exists(),
        body("kantor").exists(),
        body("alamat").exists(),
        body("telepon").exists(),
        body("fax").exists(),
        body("email").exists().isEmail(),
      ];
    }
    case "updateKantor": {
      return [];
    }
  }
};
// Create and Save a new Kantor
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Create a Kantor
  const kantor = {
    lang: req.body.lang || "id",
    tipe: req.body.tipe,
    kantor: req.body.kantor,
    alamat: req.body.alamat,
    telepon: req.body.telepon,
    fax: req.body.fax,
    email: req.body.email,
  };

  // Save Kantor in the database
  Kantor.create(kantor)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Kantor.",
      });
    });
};

// Retrieve all Kantor from the database.
exports.findAll = (req, res) => {
  const lang = req.query.lang;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;
  const tipe = req.query.tipe;
  var condition = {
    [Op.and]: [
      search
        ? {
            [Op.or]: [
              { kantor: { [Op.like]: `%${search}%` } },
              { alamat: { [Op.like]: `%${search}%` } },
              { telepon: { [Op.like]: `%${search}%` } },
              { fax: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
            ],
          }
        : null,
      tipe ? { tipe: tipe } : null,
      status ? { status: status } : null,
      lang ? { lang: lang } : null,
    ],
  };

  var query =
    nopage == 1
      ? Kantor.findAll({
          where: condition,
          order: [["urutan", "DESC"]],
        })
      : Kantor.findAndCountAll({
          where: condition,
          limit: req.query.limit,
          offset: req.skip,
          order: [["urutan", "DESC"]],
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
        message: err.message || "Some error occurred while retrieving kantor.",
      });
    });
};

// Find a single Kantor with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Kantor.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Kantor with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Kantor with id=" + id,
      });
    });
};

// Update a Kantor by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  let kantor = req.body;
  Kantor.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Kantor with id=" + id,
        });
      } else {
        data.update(kantor);
        res.send({
          message: "Kantor was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Kantor with id=" + id,
      });
    });
};

// Update a Kantor by the id in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const id = data[i].id;
      delete data[i].id;
      var result = await Kantor.update(data[i], {
        where: { id: id },
      });
      if (result[0] > 0) {
        messages.push(`Kantor with id ${id} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Kantor with id=${id}. Maybe Kantor was not found or req.body is empty!`
        );
      }
    }
    res.send({
      message: messages,
    });
  } else {
    res.status(400).send({
      message: "Invalid JSON data!",
    });
  }
};

// Delete a Kantor with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Kantor.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Kantor with id=" + id,
        });
      } else {
        data.destroy();
        res.send({
          message: "Kantor was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Kantor with id=" + id,
      });
    });
};

// Delete all Kantor from the database.
exports.deleteAll = (req, res) => {
  Kantor.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Kantor were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all kantor.",
      });
    });
};

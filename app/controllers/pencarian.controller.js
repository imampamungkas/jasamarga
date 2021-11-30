const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Pencarian = db.pencarian;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createPencarian": {
      return [
        body("url_link").exists(),
        body("keyword").exists(),
      ];
    }
    case "updatePencarian": {
      return [];
    }
  }
};
// Create and Save a new Pencarian
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const pencarian = req.body;

  // Save Pencarian in the database
  Pencarian.create(pencarian)
    .then(async (data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Pencarian.",
      });
    });
};

// Retrieve all Pencarian from the database.
exports.findAll = (req, res) => {
  const nopage = req.query.nopage || 0;
  const search = req.query.search;

  var condition = search
    ? {
      [Op.or]: [
        { '$keyword$': { [Op.like]: `%${search}%` } },
      ],
    }
    : null;

  var query =
    nopage == 1
      ? Pencarian.findAll({
        where: condition,
        order: [["createdAt", "DESC"]],
      })
      : Pencarian.findAndCountAll({
        where: condition,
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
        message: err.message || "Some error occurred while retrieving pencarian.",
      });
    });
};

// Find a single Pencarian with an uuid
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;

  Pencarian.findOne({
    where: { uuid: uuid },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Pencarian with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Pencarian with uuid=" + uuid,
      });
    });
};

// Update a Pencarian by the uuid in the request
exports.update = async (req, res) => {
  const uuid = req.params.uuid;
  const pencarian = req.body;
  Pencarian.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Pencarian with uuid=" + uuid,
        });
      } else {
        data.update(pencarian);
        res.send({
          message: "Pencarian was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Pencarian with uuid=" + uuid,
      });
    });
};

// Delete a Pencarian with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Pencarian.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Pencarian with uuid=" + uuid,
        });
      } else {
        data.destroy();
        res.send({
          message: "Pencarian was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Pencarian with uuid=" + uuid,
      });
    });
};

// Delete all Pencarian from the database.
exports.deleteAll = (req, res) => {
  Pencarian.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Pencarian were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all pencarian.",
      });
    });
};

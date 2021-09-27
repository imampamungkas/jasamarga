const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Asean = db.asean;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { timeStamp } = require("console");

exports.validate = (method) => {
  switch (method) {
    case "createAsean": {
      return [
        body("grup").exists(),
        body("no_ref").exists(),
        body("pertanyaan").exists(),
        body("implementasi").exists(),
        body("sumber_judul").exists(),
        body("sumber_link").exists(),
      ];
    }
    case "updateAsean": {
      return [];
    }
  }
};
// Create and Save a new Asean
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Create a Asean
  const asean = {
    lang: req.body.lang || "id",
    grup: req.body.grup,
    no_ref: req.body.no_ref,
    pertanyaan: req.body.pertanyaan,
    implementasi: req.body.implementasi,
    sumber_judul: req.body.sumber_judul,
    sumber_link: req.body.sumber_link,
  };

  // Save Asean in the database
  Asean.create(asean)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Asean.",
      });
    });
};

// Retrieve all Asean from the database.
exports.findAll = (req, res) => {
  const lang = req.query.lang;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;
  var condition = {
    [Op.and]: [
      search
        ? {
            [Op.or]: [
              { grup: { [Op.like]: `%${search}%` } },
              { no_ref: { [Op.like]: `%${search}%` } },
              { pertanyaan: { [Op.like]: `%${search}%` } },
              { implementasi: { [Op.like]: `%${search}%` } },
              { sumber_judul: { [Op.like]: `%${search}%` } },
            ],
          }
        : null,
      status ? { status: status } : null,
      lang ? { lang: lang } : null,
    ],
  };

  var query =
    nopage == 1
      ? Asean.findAll({
          where: condition,
          order: [
            ["grup", "ASC"],
            ["no_ref", "ASC"],
          ],
        })
      : Asean.findAndCountAll({
          where: condition,
          limit: req.query.limit,
          offset: req.skip,
          order: [
            ["grup", "ASC"],
            ["no_ref", "ASC"],
          ],
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
        message: err.message || "Some error occurred while retrieving asean.",
      });
    });
};

// Find a single Asean with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Asean.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Asean with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Asean with id=" + id,
      });
    });
};

// Update a Asean by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  let asean = req.body;
  Asean.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Asean with id=" + id,
        });
      } else {
        data.update(asean);
        res.send({
          message: "Asean was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Asean with id=" + id,
      });
    });
};

// Update a Asean by the id in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const id = data[i].id;
      delete data[i].id;
      var result = await Asean.update(data[i], {
        where: { id: id },
      });
      if (result[0] > 0) {
        messages.push(`Asean with id ${id} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Asean with id=${id}. Maybe Asean was not found or req.body is empty!`
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

// Delete a Asean with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Asean.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Asean with id=" + id,
        });
      } else {
        data.destroy();
        res.send({
          message: "Asean was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Asean with id=" + id,
      });
    });
};

// Delete all Asean from the database.
exports.deleteAll = (req, res) => {
  Asean.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Asean were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all asean.",
      });
    });
};

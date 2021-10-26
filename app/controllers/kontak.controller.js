const paginate = require("express-paginate");
const db = require("../models");
const Kontak = db.kontak;
const Op = db.Sequelize.Op;

// Retrieve all Kontak from the database.
exports.findAll = (req, res) => {
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  var condition = {
    [Op.and]: [
      search
        ? {
            [Op.or]: [
              { nama: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
              { judul: { [Op.like]: `%${search}%` } },
              { pesan: { [Op.like]: `%${search}%` } },
            ],
          }
        : null,
    ],
  };

  var query =
    nopage == 1
      ? Kontak.findAll({
          where: condition,
          order: [["updatedAt", "DESC"]],
        })
      : Kontak.findAndCountAll({
          where: condition,
          limit: req.query.limit,
          offset: req.skip,
          order: [["updatedAt", "DESC"]],
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
        message: err.message || "Some error occurred while retrieving kontak.",
      });
    });
};

// Find a single Kontak with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Kontak.findOne({
    where: { id: id },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Kontak with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Kontak with id=" + id,
      });
    });
};

// Delete a Kontak with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Kontak.findOne({
    where: { id: id },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Kontak with id=" + id,
        });
      } else {
        data.destroy();
        res.send({
          message: "Kontak was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Kontak with id=" + id,
      });
    });
};

// Delete all Kontak from the database.
exports.deleteAll = (req, res) => {
  Kontak.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Kontak were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all kontak.",
      });
    });
};

const paginate = require("express-paginate");
const db = require("../../models");
const Pencarian = db.pencarian;
const Op = db.Sequelize.Op;

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
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Pencarian with an uuid
exports.findByPk = (req, res) => {
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

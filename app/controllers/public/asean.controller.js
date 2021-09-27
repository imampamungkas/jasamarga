const paginate = require("express-paginate");
const db = require("../../models");
const Asean = db.asean;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;

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
      { status: "publish" },
      { lang: lang },
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
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Asean with an id
exports.findByPk = (req, res) => {
  const id = req.params.id;

  Asean.findOne({ where: { id: id } })
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

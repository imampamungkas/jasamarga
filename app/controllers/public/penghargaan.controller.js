const paginate = require("express-paginate");
const db = require("../../models");
const Penghargaan = db.penghargaan;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tahun = req.query.tahun;

  var condition = {
    [Op.and]: [
      search
        ? {
            [Op.or]: [
              { nama: { [Op.like]: `%${search}%` } },
              { deskripsi: { [Op.like]: `%${search}%` } },
            ],
          }
        : null,
      { status: "publish" },
      { lang: lang },
      tahun ? { tahun: tahun } : null,
    ],
  };
  var query =
    nopage == 1
      ? Penghargaan.findAll({
          where: condition,
          order: [["urutan", "DESC"]],
        })
      : Penghargaan.findAndCountAll({
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
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Penghargaan with an id
exports.findByPk = (req, res) => {
  const id = req.params.id;

  Penghargaan.findOne({ where: { id: id } })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Penghargaan with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Penghargaan with id=" + id,
      });
    });
};

// Find a single Penghargaan with an id
exports.findBySlug = (req, res) => {
  const lang = req.query.lang || "id";
  const slug = req.params.slug;

  Penghargaan.findOne({ where: { slug: slug, lang: lang } })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Penghargaan with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Penghargaan with id=" + id,
      });
    });
};

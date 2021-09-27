const paginate = require("express-paginate");
const db = require("../../models");
const Dokumen = db.dokumen;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tipe = req.params.tipe;

  var condition = {
    [Op.and]: [
      search
        ? {
            [Op.or]: [
              { nama: { [Op.like]: `%${search}%` } },
              { nama_file: { [Op.like]: `%${search}%` } },
            ],
          }
        : null,
      { status: "publish" },
      { tipe: tipe },
      { lang: lang },
    ],
  };
  var query =
    nopage == 1
      ? Dokumen.findAll({
          where: condition,
          order: [["urutan", "DESC"]],
        })
      : Dokumen.findAndCountAll({
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

// Find a single Dokumen with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  const tipe = req.params.tipe;

  Dokumen.findOne({ where: { [Op.and]: [{ id: id }, { tipe: tipe }] } })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: `Error retrieving ${tipe} with id = ${id}`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving ${tipe} with id = ${id}`,
      });
    });
};

const paginate = require("express-paginate");
const db = require("../../models");
const Artikel = db.artikel;
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
              { judul: { [Op.like]: `%${search}%` } },
              { teks: { [Op.like]: `%${search}%` } },
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
      ? Artikel.findAll({
          where: condition,
          order: [["updatedAt", "DESC"]],
        })
      : Artikel.findAndCountAll({
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
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Artikel with an id
exports.findBySlug = (req, res) => {
  const slug = req.params.slug;
  const tipe = req.params.tipe;

  Artikel.findOne({
    where: { [Op.and]: [{ slug: slug }, { tipe: tipe }] },
    include: ["gambar"],
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: `Error retrieving ${tipe} with slug = ${slug}`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving ${tipe} with slug = ${slug}`,
      });
    });
};

const paginate = require("express-paginate");
const db = require("../../models");
const Kantor = db.kantor;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
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
      { status: "publish" },
      { lang: lang },
      tipe ? { tipe: tipe } : null,
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
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Kantor with an id
exports.findByPk = (req, res) => {
  const id = req.params.id;

  Kantor.findOne({ where: { id: id } })
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

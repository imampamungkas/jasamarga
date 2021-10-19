const paginate = require("express-paginate");
const db = require("../../models");
const Kantor = db.kantor;
const KantorI18n = db.kantorI18n;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "uuid";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tipe = req.query.tipe;
  var condition = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { telepon: { [Op.like]: `%${search}%` } },
            { fax: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      tipe ? { tipe: tipe } : null,
    ],
  };

  var condition_i18n = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { '$i18n.nama_kantor$': { [Op.like]: `%${search}%` } },
            { '$i18n.alamat$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { '$i18n.lang$': lang },
    ],
  };
  var query =
    nopage == 1
      ? Kantor.findAll({
        where: condition,
        include: {
          model: KantorI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        order: [["urutan", "DESC"]],
      })
      : Kantor.findAndCountAll({
        where: condition,
        include: {
          model: KantorI18n,
          as: 'i18n',
          where: condition_i18n,
        },
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

// Find a single Kantor with an uuid
exports.findByPk = (req, res) => {
  const uuid = req.params.uuid;
  const lang = req.query.lang || "id";

  Kantor.findOne({
    where: {
      [Op.and]: [{ uuid: uuid }]
    },
    include: {
      model: KantorI18n,
      as: 'i18n',
      where: { '$i18n.lang$': lang },
    },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Kantor with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Kantor with uuid=" + uuid,
      });
    });
};

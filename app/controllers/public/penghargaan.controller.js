const paginate = require("express-paginate");
const db = require("../../models");
const PenghargaanI18n = db.penghargaanI18n;
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
            { nama_file: { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { status: "publish" },
      tahun ? { tahun: tahun } : null,
    ],
  };
  var condition_i18n = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { '$i18n.nama$': { [Op.like]: `%${search}%` } },
            { '$i18n.deskripsi$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { '$i18n.lang$': lang },
    ],
  };
  var query =
    nopage == 1
      ? Penghargaan.findAll({
        where: condition,
        include: {
          model: PenghargaanI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        order: [["urutan", "DESC"]],
      })
      : Penghargaan.findAndCountAll({
        where: condition,
        include: {
          model: PenghargaanI18n,
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

// Find a single Penghargaan with an uuid
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;
  const lang = req.query.lang || "id";


  Penghargaan.findOne({
    where: { uuid: uuid },
    include: {
      model: PenghargaanI18n,
      as: 'i18n',
      where: { '$i18n.lang$': lang },
    }
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Penghargaan with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Penghargaan with uuid=" + uuid,
      });
    });
};
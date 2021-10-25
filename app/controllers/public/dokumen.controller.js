//@ts-check
const paginate = require("express-paginate");
const db = require("../../models");
const Dokumen = db.dokumen;
const DokumenI18n = db.dokumenI18n;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tahun = req.query.tahun;
  const tipe = req.params.tipe;

  var condition = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { cover_file: { [Op.like]: `%${search}%` } },
            { dokumen_file: { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { status: "publish" },
      tahun ? { tahun: tahun } : null,
      { tipe: tipe },
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
      ? Dokumen.findAll({
        where: condition,
        include: {
          model: DokumenI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        order: [["createdAt", "DESC"]],
      })
      : Dokumen.findAndCountAll({
        where: condition,
        include: {
          model: DokumenI18n,
          as: 'i18n',
          where: condition_i18n,
        },
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
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Dokumen with an id
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;
  const tipe = req.params.tipe;
  const lang = req.query.lang || "id";

  Dokumen.findOne({
    where: {
      [Op.and]: [
        { uuid: uuid },
        { tipe: tipe },
        { status: "publish" },
      ]
    },
    include: {
      model: DokumenI18n,
      as: 'i18n',
      where: { '$i18n.lang$': lang },
    },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: `Error retrieving ${tipe} with uuid = ${uuid}`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving ${tipe} with uuid = ${uuid}`,
      });
    });
};

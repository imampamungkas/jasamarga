//@ts-check
const paginate = require("express-paginate");
const db = require("../../models");
const banerConfig = require("../../config/baner.config");
const Baner = db.baner;
const BanerI18n = db.banerI18n;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tipe = req.params.tipe;

  var condition = {
    [Op.and]: [
      banerConfig.use_publish.includes(tipe) ? { status: "publish" } : null,
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
            { '$baner.nama_file$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { '$i18n.lang$': lang },
    ],
  };
  var query =
    nopage == 1
      ? Baner.findAll({
        where: condition,
        include: {
          model: BanerI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        order: [["urutan", "DESC"]],
      })
      : Baner.findAndCountAll({
        where: condition,
        include: {
          model: BanerI18n,
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

// Find a single Baner with an id
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;
  const tipe = req.params.tipe;
  const lang = req.query.lang || "id";

  var condition = { uuid: uuid, tipe: tipe };
  if (banerConfig.use_publish.includes(tipe)) {
    condition["status"] = "publish";
  }
  Baner.findOne({
    where: condition,
    include: {
      model: BanerI18n,
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

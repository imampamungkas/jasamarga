//@ts-check
const paginate = require("express-paginate");
const db = require("../../models");
const Presskit = db.presskit;
const PresskitI18n = db.presskitI18n;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tahun = req.query.tahun;
  const tipe = req.query.tipe;

  var condition = {
    [Op.and]: [
      { status: "publish" },
      tipe ? { tipe: tipe } : null,
    ],
  };

  var condition_i18n = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { '$i18n.nama$': { [Op.like]: `%${search}%` } },
            { '$i18n.deskripsi$': { [Op.like]: `%${search}%` } },
            { '$presskit.presskit_file$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { '$i18n.lang$': lang },
    ],
  };
  var query =
    nopage == 1
      ? Presskit.findAll({
        where: condition,
        include: {
          model: PresskitI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        order: [["createdAt", "DESC"]],
      })
      : Presskit.findAndCountAll({
        where: condition,
        include: {
          model: PresskitI18n,
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

// Find a single Presskit with an id
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;
  const lang = req.query.lang || "id";

  Presskit.findOne({
    where: {
      [Op.and]: [
        { uuid: uuid },
        { status: "publish" },
      ]
    },
    include: {
      model: PresskitI18n,
      as: 'i18n',
      where: { '$i18n.lang$': lang },
    },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: `Error retrieving Presskit with uuid = ${uuid}`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving Presskit with uuid = ${uuid}`,
      });
    });
};

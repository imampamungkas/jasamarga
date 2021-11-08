const paginate = require("express-paginate");
const db = require("../../models");
const Asean = db.asean;
const AseanI18n = db.aseanI18n;
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
            { sumber_link: { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
    ],
  };

  var condition_i18n = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { '$i18n.grup$': { [Op.like]: `%${search}%` } },
            { '$i18n.no_ref$': { [Op.like]: `%${search}%` } },
            { '$i18n.pertanyaan$': { [Op.like]: `%${search}%` } },
            { '$i18n.implementasi$': { [Op.like]: `%${search}%` } },
            { '$i18n.sumber_judul$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { '$i18n.lang$': lang },
    ],
  };
  var query =
    nopage == 1
      ? Asean.findAll({
        where: condition,
        include: {
          model: AseanI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        order: [
          [{ model: AseanI18n, as: 'i18n' }, 'grup', 'asc'],
          [{ model: AseanI18n, as: 'i18n' }, 'no_ref', 'asc']
        ],
      })
      : Asean.findAndCountAll({
        where: condition,
        include: {
          model: AseanI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        limit: req.query.limit,
        offset: req.skip,
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
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Asean with an uuid
exports.findByPk = (req, res) => {
  const uuid = req.params.uuid;
  const lang = req.query.lang || "id";

  Asean.findOne({
    where: { uuid: uuid },
    include: {
      model: AseanI18n,
      as: 'i18n',
      where: { '$i18n.lang$': lang },
    }
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Asean with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Asean with uuid=" + uuid,
      });
    });
};

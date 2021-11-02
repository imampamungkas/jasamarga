//@ts-check
const db = require("../../models");
const Travoy = db.travoy;
const Op = db.Sequelize.Op;

// Retrieve all Dokumen from the database.
exports.findAsal = (req, res) => {
  const search = req.query.search;
  Travoy.aggregate('asal', 'DISTINCT', {
    where: search ? { asal: { [Op.like]: `${search}%` } } : null,
    order: [["asal", "DESC"]], plain: false
  }).then((results) => {

    res.send(results.map(function (item) {
      return item['DISTINCT'];
    }));
  })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data.",
      });
    });
};

// Retrieve all Dokumen from the database.
exports.findTujuan = (req, res) => {
  const asal = req.query.asal;
  const search = req.query.search;
  Travoy.aggregate('tujuan', 'DISTINCT', {
    where: {
      [Op.and]: [
        search ? { tujuan: { [Op.like]: `${search}%` } } : null,
        asal ? { asal: asal } : null,
      ]
    },
    order: [["tujuan", "DESC"]], plain: false
  }).then((results) => {

    res.send(results.map(function (item) {
      return item['DISTINCT'];
    }));
  })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data.",
      });
    });
};

// Retrieve all Dokumen from the database.
exports.findTarif = (req, res) => {
  const asal = req.query.asal;
  const tujuan = req.query.tujuan;
  const gol = req.query.gol;
  Travoy.findOne({
    attributes: gol ? [gol] : null,
    where: {
      [Op.and]: [
        { tujuan: tujuan },
        { asal: asal },
      ]
    }
  }).then((results) => {
    if (results == null) {
      res.status(404).send({
        message: `Error retrieving data`,
      });
    } else {
      res.send(results);
    }
  })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data.",
      });
    });
};

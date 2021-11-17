const paginate = require("express-paginate");
const db = require("../models");
const Kantor = db.kantor;
const KantorI18n = db.kantorI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createKantor": {
      return [
        body("tipe").exists(),
        // body("nama_kantor").exists(),
        // body("alamat").exists(),
        // body("telepon").exists(),
        // body("fax").exists(),
        // body("email").exists().isEmail(),
      ];
    }
    case "updateKantor": {
      return [];
    }
  }
};
// Create and Save a new Kantor
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...kantor } = req.body;

  // Save Kantor in the database
  Kantor.create(kantor)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["kantorUuid"] = data.uuid;
          await KantorI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Kantor.",
      });
    });
};

// Retrieve all Kantor from the database.
exports.findAll = (req, res) => {
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
        message: err.message || "Some error occurred while retrieving kantor.",
      });
    });
};

// Find a single Kantor with an uuid
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;

  Kantor.findOne({
    where: { uuid: uuid },
    include: 'i18n'
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

// Update a Kantor by the uuid in the request
exports.update = async (req, res) => {
  const uuid = req.params.uuid;
  const { i18n, ...kantor } = req.body;
  Kantor.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Kantor with uuid=" + uuid,
        });
      } else {
        data.update(kantor);
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await KantorI18n.findOrCreate({
              where: { kantorUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Kantor was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Kantor with uuid=" + uuid,
      });
    });
};

// Update a Kantor by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;
      var result = await Kantor.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Kantor with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Kantor with uuid=${uuid}. Maybe Kantor was not found or req.body is empty!`
        );
      }
    }
    res.send({
      message: messages,
    });
  } else {
    res.status(400).send({
      message: "Invalid JSON data!",
    });
  }
};

// Delete a Kantor with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Kantor.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Kantor with uuid=" + uuid,
        });
      } else {
        data.destroy();
        res.send({
          message: "Kantor was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Kantor with uuid=" + uuid,
      });
    });
};

// Delete all Kantor from the database.
exports.deleteAll = (req, res) => {
  Kantor.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Kantor were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all kantor.",
      });
    });
};

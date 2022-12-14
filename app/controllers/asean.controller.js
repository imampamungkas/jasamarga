const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Asean = db.asean;
const AseanI18n = db.aseanI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createAsean": {
      return [
        // body("grup").exists(),
        // body("no_ref").exists(),
        // body("pertanyaan").exists(),
        // body("implementasi").exists(),
        // body("sumber_judul").exists(),
        body("sumber_link").exists(),
      ];
    }
    case "updateAsean": {
      return [];
    }
  }
};
// Create and Save a new Asean
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...asean } = req.body;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `asean/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      asean["nama_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Asean in the database
  Asean.create(asean)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["aseanUuid"] = data.uuid;
          await AseanI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Asean.",
      });
    });
};

// Retrieve all Asean from the database.
exports.findAll = (req, res) => {
  const nopage = req.query.nopage || 0;
  const search = req.query.search;

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
            { '$asean.sumber_link$': { [Op.like]: `%${search}%` } },
            { '$asean.nama_file$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
    ],
  };

  var query =
    nopage == 1
      ? Asean.findAll({
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
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving asean.",
      });
    });
};

// Find a single Asean with an uuid
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;

  Asean.findOne({
    where: { uuid: uuid },
    include: 'i18n'
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

// Update a Asean by the uuid in the request
exports.update = async (req, res) => {
  const uuid = req.params.uuid;
  const { i18n, ...asean } = req.body;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `asean/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      asean["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete asean.nama_file;
    }
  }
  Asean.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Asean with uuid=" + uuid,
        });
      } else {
        if (asean.nama_file != null && data.nama_file != null) {
          var dir = data.nama_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(asean);
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await AseanI18n.findOrCreate({
              where: { aseanUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Asean was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Asean with uuid=" + uuid,
      });
    });
};

// Delete a Asean with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Asean.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Asean with uuid=" + uuid,
        });
      } else {
        if (data.nama_file != null) {
          var dir = data.nama_file.split("/");
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.destroy();
        res.send({
          message: "Asean was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Asean with uuid=" + uuid,
      });
    });
};

// Delete all Asean from the database.
exports.deleteAll = (req, res) => {
  Asean.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Asean were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all asean.",
      });
    });
};

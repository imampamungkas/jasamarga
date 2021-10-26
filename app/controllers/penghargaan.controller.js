const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Penghargaan = db.penghargaan;
const PenghargaanI18n = db.penghargaanI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { penghargaan } = require("../models");

exports.validate = (method) => {
  switch (method) {
    case "createPenghargaan": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        body("urutan").exists(),
        body("tahun").exists(),
      ];
    }
    case "updatePenghargaan": {
      return [];
    }
  }
};
// Create and Save a new Penghargaan
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...penghargaan } = req.body;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `penghargaan/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      penghargaan["nama_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Penghargaan in the database
  Penghargaan.create(penghargaan)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["penghargaanUuid"] = data.uuid;
          await PenghargaanI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Penghargaan.",
      });
    });
};

// Retrieve all Penghargaan from the database.
exports.findAll = (req, res) => {
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;
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
      status ? { status: status } : null,
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
        message:
          err.message || "Some error occurred while retrieving penghargaan.",
      });
    });
};

// Find a single Penghargaan with an uuid
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;

  Penghargaan.findOne({
    where: { uuid: uuid },
    include: 'i18n'
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

// Update a Penghargaan by the uuid in the request
exports.update = async (req, res) => {
  const uuid = req.params.uuid;
  const { i18n, ...penghargaan } = req.body;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `penghargaan/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      penghargaan["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete penghargaan.nama_file;
    }
  }
  Penghargaan.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Penghargaan with uuid=" + uuid,
        });
      } else {
        if (data.nama_file != null) {
          var dir = data.nama_file.split("/");
          console.log("dir", dir);
          path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(penghargaan);
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await PenghargaanI18n.findOrCreate({
              where: { penghargaanUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Penghargaan was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Penghargaan with uuid=" + uuid,
      });
    });
};

// Update a Penghargaan by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const { uuid, ...penghargaan } = data[i];
      console.log("uuid ", uuid);
      console.log("penghargaan", penghargaan);
      var result = await Penghargaan.update(penghargaan, {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Penghargaan with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Penghargaan with uuid=${uuid}. Maybe Penghargaan was not found or req.body is empty!`
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

// Delete a Penghargaan with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Penghargaan.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Penghargaan with uuid=" + uuid,
        });
      } else {
        if (data.nama_file != null) {
          var dir = data.nama_file.split("/");
          path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.destroy();
        res.send({
          message: "Penghargaan was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Penghargaan with uuid=" + uuid,
      });
    });
};

// Delete all Penghargaan from the database.
exports.deleteAll = (req, res) => {
  Penghargaan.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      path = "public/uploads/penghargaan";
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Penghargaan were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all penghargaan.",
      });
    });
};

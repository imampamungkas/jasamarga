//@ts-check
const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Baner = db.baner;
const BanerI18n = db.banerI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createBaner": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        body("urutan").exists(),
      ];
    }
    case "updateBaner": {
      return [];
    }
  }
};
// Create and Save a new Baner
exports.create = async (req, res) => {
  const tipe = req.params.tipe;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...baner } = req.body;
  baner["tipe"] = tipe;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `baner-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      baner["nama_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Baner in the database
  Baner.create(baner)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["banerUuid"] = data.uuid;
          await BanerI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Baner.",
      });
    });
};

// Retrieve all Baner from the database.
exports.findAll = (req, res) => {
  const tipe = req.params.tipe;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;

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
        message:
          err.message || "Some error occurred while retrieving baner.",
      });
    });
};

// Find a single Baner with an uuid
exports.findOne = (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  Baner.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
    include: 'i18n'
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Baner with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Baner with uuid=" + uuid,
      });
    });
};

// Update a Baner by the uuid in the request
exports.update = async (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  const { i18n, ...baner } = req.body;
  baner["tipe"] = tipe;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `baner-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      baner["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete baner.nama_file;
    }
  }
  Baner.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Baner with uuid=" + uuid,
        });
      } else {
        if (data.nama_file !== null) {
          var dir = data.nama_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(baner);

        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            await BanerI18n.update(trans, {
              where: { [Op.and]: [{ banerUuid: uuid }, { lang: lang }] },
            });
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Baner was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Baner with uuid=" + uuid,
      });
    });
};

// Update a Baner by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await Baner.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Baner with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Baner with uuid=${uuid}. Maybe Baner was not found or req.body is empty!`
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

// Delete a Baner with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Baner.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Baner with uuid=" + uuid,
        });
      } else {
        if (data.nama_file !== null) {
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
          message: "Baner was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Baner with uuid=" + uuid,
      });
    });
};

// Delete all Baner from the database.
exports.deleteAll = (req, res) => {
  const tipe = req.params.tipe;
  Baner.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      var path = `public/uploads/baner-${tipe}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Baner were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all baner.",
      });
    });
};

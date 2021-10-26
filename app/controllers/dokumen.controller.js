//@ts-check
const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Dokumen = db.dokumen;
const DokumenI18n = db.dokumenI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createDokumen": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("updatedAt").exists(),
      ];
    }
    case "updateDokumen": {
      return [];
    }
  }
};
// Create and Save a new Dokumen
exports.create = async (req, res) => {
  const tipe = req.params.tipe;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...dokumen } = req.body;
  dokumen["tipe"] = tipe;
  if (dokumen.hasOwnProperty("cover_file")) {
    if (dokumen.cover_file) {
      var file_name = dokumen.cover_file.nama;
      const b = Buffer.from(dokumen.cover_file.data, "base64");
      const timestamp = `dokumen-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      dokumen["cover_file"] = `${timestamp}/${file_name}`;
    }
  }
  if (dokumen.hasOwnProperty("dokumen_file")) {
    if (dokumen.dokumen_file) {
      var file_name = dokumen.dokumen_file.nama;
      const b = Buffer.from(dokumen.dokumen_file.data, "base64");
      const timestamp = `dokumen-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      dokumen["dokumen_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Dokumen in the database
  Dokumen.create(dokumen)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["dokumenUuid"] = data.uuid;
          await DokumenI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Dokumen.",
      });
    });
};

// Retrieve all Dokumen from the database.
exports.findAll = (req, res) => {
  const tipe = req.params.tipe;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tahun = req.query.tahun;
  const status = req.query.status;

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
      tahun ? { tahun: tahun } : null,
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
      ? Dokumen.findAll({
        where: condition,
        include: [
          {
            model: DokumenI18n,
            as: 'i18n',
            where: condition_i18n,
          }
        ],
        order: [["updatedAt", "DESC"]],
      })
      : Dokumen.findAndCountAll({
        where: condition,
        include: [
          {
            model: DokumenI18n,
            as: 'i18n',
            where: condition_i18n,
          }
        ],
        limit: req.query.limit,
        offset: req.skip,
        order: [["updatedAt", "DESC"]],
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
          err.message || "Some error occurred while retrieving dokumen.",
      });
    });
};

// Find a single Dokumen with an uuid
exports.findOne = (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  Dokumen.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
    include: [
      {
        model: DokumenI18n,
        as: 'i18n',
      }
    ]
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Dokumen with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Dokumen with uuid=" + uuid,
      });
    });
};

// Update a Dokumen by the uuid in the request
exports.update = async (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  const { i18n, ...dokumen } = req.body;
  dokumen["tipe"] = tipe;
  if (dokumen.hasOwnProperty("cover_file")) {
    if (dokumen.cover_file) {
      var file_name = dokumen.cover_file.nama;
      const b = Buffer.from(dokumen.cover_file.data, "base64");
      const timestamp = `dokumen-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      dokumen["cover_file"] = `${timestamp}/${file_name}`;
    } else {
      delete dokumen.cover_file;
    }
  }
  if (dokumen.hasOwnProperty("dokumen_file")) {
    if (dokumen.dokumen_file) {
      var file_name = dokumen.dokumen_file.nama;
      const b = Buffer.from(dokumen.dokumen_file.data, "base64");
      const timestamp = `dokumen-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      dokumen["dokumen_file"] = `${timestamp}/${file_name}`;
    } else {
      delete dokumen.dokumen_file;
    }
  }
  Dokumen.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Dokumen with uuid=" + uuid,
        });
      } else {
        if (data.cover_file != null) {
          var dir = data.cover_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        if (data.dokumen_file != null) {
          var dir = data.dokumen_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(dokumen);

        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            await DokumenI18n.update(trans, {
              where: { [Op.and]: [{ dokumenUuid: uuid }, { lang: lang }] },
            });
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Dokumen was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Dokumen with uuid=" + uuid,
      });
    });
};

// Delete a Dokumen with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Dokumen.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Dokumen with uuid=" + uuid,
        });
      } else {
        if (data.dokumen_file != null) {
          var dir = data.dokumen_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        if (data.cover_file != null) {
          var dir = data.cover_file.split("/");
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.destroy();
        res.send({
          message: "Dokumen was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Dokumen with uuid=" + uuid,
      });
    });
};

// Delete all Dokumen from the database.
exports.deleteAll = (req, res) => {
  const tipe = req.params.tipe;
  Dokumen.destroy({
    where: { tipe: tipe },
    truncate: false,
  })
    .then((nums) => {
      var path = `public/uploads/dokumen-${tipe}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Dokumen were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all dokumen.",
      });
    });
};

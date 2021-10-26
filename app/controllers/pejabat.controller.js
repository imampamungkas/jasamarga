//@ts-check
const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Pejabat = db.pejabat;
const PejabatI18n = db.pejabatI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createPejabat": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        body("urutan").exists(),
        // body("jabatan").exists(),
      ];
    }
    case "updatePejabat": {
      return [];
    }
  }
};
// Create and Save a new Pejabat
exports.create = async (req, res) => {
  const tipe = req.params.tipe;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...pejabat } = req.body;
  pejabat["tipe"] = tipe;
  // console.log('pejabat',pejabat);
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `pejabat-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      pejabat["nama_file"] = `${timestamp}/${file_name}`;
    }
  }
  // Save Pejabat in the database
  Pejabat.create(pejabat)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["pejabatUuid"] = data.uuid;
          await PejabatI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }

      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Pejabat.",
      });
    });
};

// Retrieve all Pejabat from the database.
exports.findAll = (req, res) => {
  const tipe = req.params.tipe;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;
  const kategori = req.query.kategori;

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
      kategori ? { kategori: kategori } : null,
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
            { '$i18n.jabatan$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
    ],
  };


  var query =
    nopage == 1
      ? Pejabat.findAll({
        where: condition,
        include: {
          model: PejabatI18n,
          as: 'i18n',
          where: condition_i18n,
        },
        order: [["urutan", "DESC"]],
      })
      : Pejabat.findAndCountAll({
        where: condition,
        include: {
          model: PejabatI18n,
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
        message: err.message || "Some error occurred while retrieving pejabat.",
      });
    });
};

// Find a single Pejabat with an uuid
exports.findOne = (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  Pejabat.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
    include: 'i18n'
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Pejabat with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Pejabat with uuid=" + uuid,
      });
    });
};

// Update a Pejabat by the uuid in the request
exports.update = async (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  const { i18n, ...pejabat } = req.body;
  pejabat["tipe"] = tipe;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `pejabat-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      pejabat["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete pejabat.nama_file;
    }
  }
  Pejabat.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
    include: 'i18n'
  })
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Pejabat with uuid=" + uuid,
        });
      } else {
        if (data.nama_file != null) {
          var dir = data.nama_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(pejabat);
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await PejabatI18n.findOrCreate({
              where: { pejabatUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Pejabat was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Pejabat with uuid=" + uuid,
      });
    });
};

// Update a Pejabat by the uuid in the request
exports.updateBulk = async (req, res) => {
  const tipe = req.params.tipe;
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;
      data[i].tipe = tipe;
      var result = await Pejabat.update(data[i], {
        where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
      });
      if (result[0] > 0) {
        messages.push(
          `Pejabat with uuid ${uuid} ${tipe} was updated successfully.`
        );
      } else {
        messages.push(
          `Cannot update Pejabat with uuid=${uuid} ${tipe}. Maybe Pejabat was not found or req.body is empty!`
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


// Delete a Pejabat with the specified uuid in the request
exports.delete = (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  Pejabat.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Pejabat with uuid=" + uuid,
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
          message: "Pejabat was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Pejabat with uuid=" + uuid,
      });
    });
};

// Delete all Pejabat from the database.
exports.deleteAll = (req, res) => {
  const tipe = req.params.tipe;
  Pejabat.destroy({
    where: { tipe: tipe },
    truncate: false,
  })
    .then((nums) => {
      var path = `public/uploads/pejabat-${tipe}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Pejabat were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all pejabat.",
      });
    });
};

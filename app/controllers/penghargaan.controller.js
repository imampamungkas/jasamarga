const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Penghargaan = db.penghargaan;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createPenghargaan": {
      return [
        body("nama").exists(),
        body("deskripsi").exists(),
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
  var file_name = null;
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
      file_name = `${timestamp}/${file_name}`;
    }
  }

  // Create a Penghargaan
  const penghargaan = {
    lang: req.body.lang || "id",
    nama: req.body.nama,
    tahun: req.body.tahun,
    deskripsi: req.body.deskripsi,
    nama_file: file_name,
    urutan: req.body.urutan,
  };

  // Save Penghargaan in the database
  Penghargaan.create(penghargaan)
    .then((data) => {
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
  const lang = req.query.lang;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;
  const tahun = req.query.tahun;
  var condition = {
    [Op.and]: [
      search
        ? {
            [Op.or]: [
              { nama: { [Op.like]: `%${search}%` } },
              { deskripsi: { [Op.like]: `%${search}%` } },
              { nama_file: { [Op.like]: `%${search}%` } },
            ],
          }
        : null,
      status ? { status: status } : null,
      tahun ? { tahun: tahun } : null,
      lang ? { lang: lang } : null,
    ],
  };

  var query =
    nopage == 1
      ? Penghargaan.findAll({
          where: condition,
          order: [["urutan", "DESC"]],
        })
      : Penghargaan.findAndCountAll({
          where: condition,
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

// Find a single Penghargaan with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Penghargaan.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Penghargaan with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Penghargaan with id=" + id,
      });
    });
};

// Update a Penghargaan by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  let penghargaan = req.body;
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
  Penghargaan.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Penghargaan with id=" + id,
        });
      } else {
        if (data.nama_file !== null) {
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
        res.send({
          message: "Penghargaan was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Penghargaan with id=" + id,
      });
    });
};

// Update a Penghargaan by the id in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const id = data[i].id;
      delete data[i].id;
      var result = await Penghargaan.update(data[i], {
        where: { id: id },
      });
      if (result[0] > 0) {
        messages.push(`Penghargaan with id ${id} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Penghargaan with id=${id}. Maybe Penghargaan was not found or req.body is empty!`
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

// Delete a Penghargaan with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Penghargaan.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Penghargaan with id=" + id,
        });
      } else {
        if (data.nama_file !== null) {
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
        message: "Error deleting Penghargaan with id=" + id,
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

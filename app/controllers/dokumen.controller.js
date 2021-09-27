const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Dokumen = db.dokumen;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { timeStamp } = require("console");

exports.validate = (method) => {
  switch (method) {
    case "createDokumen": {
      return [body("judul").exists(), body("urutan").exists()];
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

  // Create a Dokumen
  const dokumen = {
    lang: req.body.lang || "id",
    judul: req.body.judul,
    tahun: req.body.tahun,
    tipe: tipe,
    nama_file: file_name,
    urutan: req.body.urutan,
  };

  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
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
      dokumen["nama_file"] = `${timestamp}/${file_name}`;
    }
  }

  if (req.body.hasOwnProperty("thumbnail")) {
    if (req.body.thumbnail) {
      var file_name = req.body.thumbnail.nama;
      const b = Buffer.from(req.body.thumbnail.data, "base64");
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
      dokumen["thumbnail"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Dokumen in the database
  Dokumen.create(dokumen)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Dokumen.",
      });
    });
};

// Retrieve all Dokumen from the database.
exports.findAll = (req, res) => {
  const tipe = req.params.tipe;
  const lang = req.query.lang;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;
  var condition = {
    [Op.and]: [
      search
        ? {
            [Op.or]: [
              { judul: { [Op.like]: `%${search}%` } },
              { nama_file: { [Op.like]: `%${search}%` } },
            ],
          }
        : null,
      status ? { status: status } : null,
      lang ? { lang: lang } : null,
      { tipe: tipe },
    ],
  };

  var query =
    nopage == 1
      ? Dokumen.findAll({
          where: condition,
          order: [["urutan", "DESC"]],
        })
      : Dokumen.findAndCountAll({
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
        message: err.message || "Some error occurred while retrieving dokumen.",
      });
    });
};

// Find a single Dokumen with an id
exports.findOne = (req, res) => {
  const tipe = req.params.tipe;
  const id = req.params.id;

  Dokumen.findOne({
    where: { [Op.and]: [{ id: id }, { tipe: tipe }] },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Dokumen with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Dokumen with id=" + id,
      });
    });
};

// Update a Dokumen by the id in the request
exports.update = async (req, res) => {
  const tipe = req.params.tipe;
  const id = req.params.id;
  let dokumen = req.body;
  dokumen["tipe"] = tipe;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
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
      dokumen["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete dokumen.nama_file;
    }
  }
  if (req.body.hasOwnProperty("thumbnail")) {
    if (req.body.thumbnail) {
      file_name = req.body.thumbnail.nama;
      const b = Buffer.from(req.body.thumbnail.data, "base64");
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
      dokumen["thumbnail"] = `${timestamp}/${file_name}`;
    } else {
      delete dokumen.thumbnail;
    }
  }
  Dokumen.findOne({
    where: { [Op.and]: [{ id: id }, { tipe: tipe }] },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Dokumen with id=" + id,
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
        if (data.thumbnail !== null) {
          var dir = data.thumbnail.split("/");
          console.log("dir", dir);
          path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(dokumen);
        res.send({
          message: "Dokumen was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Dokumen with id=" + id,
      });
    });
};

// Update a Dokumen by the id in the request
exports.updateBulk = async (req, res) => {
  const tipe = req.params.tipe;
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const id = data[i].id;
      delete data[i].id;
      data[i].tipe = tipe;
      var result = await Dokumen.update(data[i], {
        where: { id: id },
      });
      if (result[0] > 0) {
        messages.push(`Dokumen with id ${id} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Dokumen with id=${id}. Maybe Dokumen was not found or req.body is empty!`
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

// Delete a Dokumen with the specified id in the request
exports.delete = (req, res) => {
  const tipe = req.params.tipe;
  const id = req.params.id;

  Dokumen.findOne({
    where: { [Op.and]: [{ id: id }, { tipe: tipe }] },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Dokumen with id=" + id,
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
        if (data.thumbnail !== null) {
          var dir = data.thumbnail.split("/");
          path = `public/uploads/${dir[0]}/${dir[1]}`;
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
        message: "Error deleting Dokumen with id=" + id,
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
      path = `public/uploads/dokumen-${tipe}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Dokumen were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all dokumen.",
      });
    });
};

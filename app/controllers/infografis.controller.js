const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Infografis = db.infografis;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createInfografis": {
      return [
        body("nama").exists(),
        body("deskripsi").exists(),
        body("urutan").exists(),
      ];
    }
    case "updateInfografis": {
      return [];
    }
  }
};
// Create and Save a new Infografis
exports.create = async (req, res) => {
  const tipe = req.params.tipe;
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
      const timestamp = `infografis-${tipe}/${new Date().getTime()}`;
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

  // Create a Infografis
  const infografis = {
    lang: req.body.lang || "id",
    nama: req.body.nama,
    url: req.body.url,
    deskripsi: req.body.deskripsi,
    nama_file: file_name,
    urutan: req.body.urutan,
    tipe: tipe,
  };

  // Save Infografis in the database
  Infografis.create(infografis)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Infografis.",
      });
    });
};

// Retrieve all Infografis from the database.
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
              { nama: { [Op.like]: `%${search}%` } },
              { deskripsi: { [Op.like]: `%${search}%` } },
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
      ? Infografis.findAll({
          where: condition,
          order: [["urutan", "DESC"]],
        })
      : Infografis.findAndCountAll({
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
          err.message || "Some error occurred while retrieving infografis.",
      });
    });
};

// Find a single Infografis with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Infografis.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Infografis with id=" + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Infografis with id=" + id,
      });
    });
};

// Update a Infografis by the id in the request
exports.update = async (req, res) => {
  const tipe = req.params.tipe;
  const id = req.params.id;
  let infografis = req.body;
  infografis["tipe"] = req.params.tipe;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `infografis-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      infografis["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete infografis.nama_file;
    }
  }
  Infografis.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Infografis with id=" + id,
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
        data.update(infografis);
        res.send({
          message: "Infografis was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Infografis with id=" + id,
      });
    });
};

// Update a Infografis by the id in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const id = data[i].id;
      delete data[i].id;

      var result = await Infografis.update(data[i], {
        where: { id: id },
      });
      if (result[0] > 0) {
        messages.push(`Infografis with id ${id} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Infografis with id=${id}. Maybe Infografis was not found or req.body is empty!`
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

// Delete a Infografis with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Infografis.findByPk(id)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Infografis with id=" + id,
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
          message: "Infografis was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Infografis with id=" + id,
      });
    });
};

// Delete all Infografis from the database.
exports.deleteAll = (req, res) => {
  const tipe = req.params.tipe;
  Infografis.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      path = `public/uploads/infografis-${tipe}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Infografis were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all infografis.",
      });
    });
};

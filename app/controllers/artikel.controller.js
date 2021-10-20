const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Artikel = db.artikel;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createArtikel": {
      return [body("judul").exists(), body("teks").exists()];
    }
    case "updateArtikel": {
      return [];
    }
  }
};
// Create and Save a new Artikel
exports.create = async (req, res) => {
  const tipe = req.params.tipe;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Create a Artikel
  const artikel = {
    lang: req.body.lang || "id",
    judul: req.body.judul,
    deskripsi: req.body.deskripsi,
    teks: req.body.teks,
    web_url: req.body.web_url,
    youtube_url: req.body.youtube_url,
    tipe: tipe,
  };

  if (req.body.hasOwnProperty("gambar_file")) {
    if (req.body.gambar_file) {
      var file_name = req.body.gambar_file.nama;
      const b = Buffer.from(req.body.gambar_file.data, "base64");
      const timestamp = `artikel-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      artikel["gambar_file"] = `${timestamp}/${file_name}`;
    }
  }

  if (req.body.hasOwnProperty("dokumen_file")) {
    if (req.body.dokumen_file) {
      var file_name = req.body.dokumen_file.nama;
      const b = Buffer.from(req.body.dokumen_file.data, "base64");
      const timestamp = `artikel-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      artikel["dokumen_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Artikel in the database
  Artikel.create(artikel)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Artikel.",
      });
    });
};

// Retrieve all Artikel from the database.
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
              { teks: { [Op.like]: `%${search}%` } },
              { deskripsi: { [Op.like]: `%${search}%` } },
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
      ? Artikel.findAll({
          where: condition,
          order: [["updatedAt", "DESC"]],
        })
      : Artikel.findAndCountAll({
          where: condition,
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
        message: err.message || "Some error occurred while retrieving artikel.",
      });
    });
};

// Find a single Artikel with an uuid
exports.findOne = (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  Artikel.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
    include: ["gambar"],
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Artikel with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Artikel with uuid=" + uuid,
      });
    });
};

// Update a Artikel by the uuid in the request
exports.update = async (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;
  let artikel = req.body;
  artikel["tipe"] = tipe;

  if (req.body.hasOwnProperty("gambar_file")) {
    if (req.body.gambar_file) {
      var file_name = req.body.gambar_file.nama;
      const b = Buffer.from(req.body.gambar_file.data, "base64");
      const timestamp = `artikel-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      artikel["gambar_file"] = `${timestamp}/${file_name}`;
    }
  }

  if (req.body.hasOwnProperty("dokumen_file")) {
    if (req.body.dokumen_file) {
      var file_name = req.body.dokumen_file.nama;
      const b = Buffer.from(req.body.dokumen_file.data, "base64");
      const timestamp = `artikel-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      artikel["dokumen_file"] = `${timestamp}/${file_name}`;
    }
  }

  Artikel.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Artikel with uuid=" + uuid,
        });
      } else {
        if (data.gambar_file !== null) {
          var dir = data.gambar_file.split("/");
          console.log("dir", dir);
          path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        if (data.dokumen_file !== null) {
          var dir = data.dokumen_file.split("/");
          console.log("dir", dir);
          path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(artikel);
        res.send({
          message: "Artikel was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Artikel with uuid=" + uuid,
      });
    });
};

// Delete a Artikel with the specified uuid in the request
exports.delete = (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  Artikel.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Artikel with uuid=" + uuid,
        });
      } else {
        if (data.gambar_file !== null) {
          var dir = data.gambar_file.split("/");
          path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        if (data.dokumen_file !== null) {
          var dir = data.dokumen_file.split("/");
          path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.destroy();
        res.send({
          message: "Artikel was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Artikel with uuid=" + uuid,
      });
    });
};

// Delete all Artikel from the database.
exports.deleteAll = (req, res) => {
  const tipe = req.params.tipe;
  Artikel.destroy({
    where: { tipe: tipe },
    truncate: false,
  })
    .then((nums) => {
      path = `public/uploads/artikel-${tipe}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Artikel were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all artikel.",
      });
    });
};

// Find a single Artikel with an slug
exports.findBySlug = (req, res) => {
  const lang = req.params.lang;
  const slug = req.params.slug;
  const tipe = `page-${slug}`;

  Artikel.findOne({
    where: { [Op.and]: [{ lang: lang }, { tipe: tipe }] },
    include: ["gambar"],
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: `Error retrieving ${tipe} with slug = ${slug}`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving ${tipe} with slug = ${slug}`,
      });
    });
};

// Update a Artikel by the slug in the request path
exports.updateBySlug = async (req, res) => {
  const lang = req.params.lang;
  const slug = req.params.slug;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const tipe = `page-${slug}`;
  var artikel = req.body;
  artikel["tipe"] = tipe;
  artikel["lang"] = lang;

  if (req.body.hasOwnProperty("gambar_file")) {
    if (req.body.gambar_file) {
      var file_name = req.body.gambar_file.nama;
      const b = Buffer.from(req.body.gambar_file.data, "base64");
      const timestamp = `artikel-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      artikel["gambar_file"] = `${timestamp}/${file_name}`;
    }
  }

  if (req.body.hasOwnProperty("dokumen_file")) {
    if (req.body.dokumen_file) {
      var file_name = req.body.dokumen_file.nama;
      const b = Buffer.from(req.body.dokumen_file.data, "base64");
      const timestamp = `artikel-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      artikel["dokumen_file"] = `${timestamp}/${file_name}`;
    }
  }

  Artikel.findOrCreate({
    where: {
      [Op.and]: [{ tipe: tipe }, { lang: lang }],
    },
    defaults: artikel,
  })
    .then((result) => {
      const [data, created] = result;
      if (data == null) {
        res.status(404).send({
          message: "Error updating Artikel with slug=" + slug,
        });
      } else {
        if (!created) {
          if (data.gambar_file !== null) {
            var dir = data.gambar_file.split("/");
            console.log("dir", dir);
            path = `public/uploads/${dir[0]}/${dir[1]}`;
            fs.rm(path, { recursive: true }, (err) => {
              if (err) {
                console.log("err : ", err);
              }
            });
          }
          if (data.dokumen_file !== null) {
            var dir = data.dokumen_file.split("/");
            console.log("dir", dir);
            path = `public/uploads/${dir[0]}/${dir[1]}`;
            fs.rm(path, { recursive: true }, (err) => {
              if (err) {
                console.log("err : ", err);
              }
            });
          }
        }
        data.update(artikel);
        res.send({
          message: "Artikel was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Artikel with slug=" + slug,
      });
    });
};

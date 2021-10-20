const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Gambar = db.gambar;
const Artikel = db.artikel;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createGambar": {
      return [
        body("artikelUuid").custom(async (value) => {
          if (value) {
            return Artikel.findByPk(value).then((artikel) => {
              if (artikel == null) {
                return Promise.reject("artikel uuid is not valid!");
              }
            });
          }
        }),
      ];
    }
    case "updateGambar": {
      return [
        body("artikelUuid").custom(async (value) => {
          if (value) {
            return Artikel.findByPk(value).then((artikel) => {
              if (artikel == null) {
                return Promise.reject("artikel uuid is not valid!");
              }
            });
          }
        }),
      ];
    }
  }
};
// Create and Save a new Gambar
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const artikelUuid = req.body.artikelUuid;
  const artikel = await Artikel.findByPk(artikelUuid);
  const tipe = artikel.tipe;
  // Create a Gambar
  const gambar = {
    artikelUuid: artikelUuid,
    judul: req.body.judul,
    deskripsi: req.body.deskripsi,
    urutan: req.body.urutan,
  };

  if (req.body.hasOwnProperty("gambar_file")) {
    if (req.body.gambar_file) {
      var file_name = req.body.gambar_file.nama;
      const b = Buffer.from(req.body.gambar_file.data, "base64");
      const timestamp = `gambar-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      gambar["gambar_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Gambar in the database
  Gambar.create(gambar)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Gambar.",
      });
    });
};

// Update a Gambar by the uuid in the request
exports.updateBulk = async (req, res) => {
  const artikelUuid = req.params.artikelUuid;
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;
      var result = await Gambar.update(data[i], {
        where: { [Op.and]: [{ artikelUuid: artikelUuid }, { uuid: uuid }] },
      });
      if (result[0] > 0) {
        messages.push(`Gambar with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Gambar with uuid=${uuid}. Maybe Gambar was not found or req.body is empty!`
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

// Delete a Gambar with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Gambar.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Gambar with uuid=" + uuid,
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
        data.destroy();
        res.send({
          message: "Gambar was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Gambar with uuid=" + uuid,
      });
    });
};

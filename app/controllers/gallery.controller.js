//@ts-check
const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Gallery = db.gallery;
const GalleryI18n = db.galleryI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createGallery": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        body("urutan").exists(),
      ];
    }
    case "updateGallery": {
      return [];
    }
  }
};
// Create and Save a new Gallery
exports.create = async (req, res) => {
  const pageSlug = req.params.pageSlug;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...gallery } = req.body;
  gallery["pageSlug"] = pageSlug;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `gallery-${pageSlug}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      gallery["nama_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Gallery in the database
  Gallery.create(gallery)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["galleryUuid"] = data.uuid;
          await GalleryI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Gallery.",
      });
    });
};

// Update a Gallery by the uuid in the request
exports.update = async (req, res) => {
  const pageSlug = req.params.pageSlug;
  const uuid = req.params.uuid;

  const { i18n, ...gallery } = req.body;
  gallery["pageSlug"] = pageSlug;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `gallery-${pageSlug}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      gallery["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete gallery.nama_file;
    }
  }
  Gallery.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Gallery with uuid=" + uuid,
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

        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await GalleryI18n.findOrCreate({
              where: { galleryUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
        }

        data.update(gallery).then(async (result) => {
          await result.reload({ include: 'i18n' });
          res.send({
            message: "Gallery was updated successfully.",
            data: result,
          });
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Gallery with uuid=" + uuid,
      });
    });
};

// Update a Gallery by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await Gallery.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Gallery with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Gallery with uuid=${uuid}. Maybe Gallery was not found or req.body is empty!`
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

// Delete a Gallery with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Gallery.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Gallery with uuid=" + uuid,
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
          message: "Gallery was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Gallery with uuid=" + uuid,
      });
    });
};

// Delete all Gallery from the database.
exports.deleteAll = (req, res) => {
  const pageSlug = req.params.pageSlug;
  Gallery.destroy({
    where: { pageSlug: pageSlug },
    truncate: false,
  })
    .then((nums) => {
      var path = `public/uploads/gallery-${pageSlug}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Gallery were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all gallery.",
      });
    });
};

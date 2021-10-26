//@ts-check
const fs = require("fs");
const db = require("../models");
const Photo = db.photo;
const PhotoI18n = db.photoI18n;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createPhoto": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        body("urutan").exists(),
      ];
    }
    case "updatePhoto": {
      return [];
    }
  }
};
// Create and Save a new Photo
exports.create = async (req, res) => {
  const postUuid = req.params.postUuid;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...photo } = req.body;
  photo["postUuid"] = postUuid;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `photo-${postUuid}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      photo["nama_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Photo in the database
  Photo.create(photo)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["photoUuid"] = data.uuid;
          await PhotoI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Photo.",
      });
    });
};

// Update a Photo by the uuid in the request
exports.update = async (req, res) => {
  const postUuid = req.params.postUuid;
  const uuid = req.params.uuid;

  const { i18n, ...photo } = req.body;
  photo["postUuid"] = postUuid;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `photo-${postUuid}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      photo["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete photo.nama_file;
    }
  }
  Photo.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Photo with uuid=" + uuid,
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

        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await PhotoI18n.findOrCreate({
              where: { photoUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
        }

        data.update(photo).then(async (result) => {
          await result.reload({ include: 'i18n' });
          res.send({
            message: "Photo was updated successfully.",
            data: result,
          });
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Photo with uuid=" + uuid,
      });
    });
};

// Update a Photo by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await Photo.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Photo with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Photo with uuid=${uuid}. Maybe Photo was not found or req.body is empty!`
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

// Delete a Photo with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Photo.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Photo with uuid=" + uuid,
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
          message: "Photo was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Photo with uuid=" + uuid,
      });
    });
};

// Delete all Photo from the database.
exports.deleteAll = (req, res) => {
  const postUuid = req.params.postUuid;
  Photo.destroy({
    where: { postUuid: postUuid },
    truncate: false,
  })
    .then((nums) => {
      var path = `public/uploads/photo-${postUuid}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Photo were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all photo.",
      });
    });
};

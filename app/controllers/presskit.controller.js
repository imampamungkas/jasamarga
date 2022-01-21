//@ts-check
const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Presskit = db.presskit;
const PresskitI18n = db.presskitI18n;
const Op = db.Sequelize.Op;
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const timestamp = `presskit/${new Date().getTime()}`;
    var dir = `public/uploads/${timestamp}/`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createPresskit": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("updatedAt").exists(),
      ];
    }
    case "updatePresskit": {
      return [];
    }
  }
};

var upload = multer({ storage: storage }).single('presskit_file');

// Create and Save a new Presskit
exports.create_form = async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    const { i18n, ...presskit } = req.body;
    if (req.file != null) {
      const { path } = req.file;
      presskit["presskit_file"] = path.replace('public/uploads/', '');
    }
    Presskit.create(presskit)
      .then(async (data) => {
        if (i18n != null) {
          for (var [key, value] of Object.entries(i18n)) {
            value["presskitUuid"] = data.uuid;
            value["lang"] = key;
            await PresskitI18n.create(value);
          }
          await data.reload({ include: 'i18n' });
        }
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Presskit.",
        });
      });
  });
};
// Create and Save a new Presskit
exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { i18n, ...presskit } = req.body;
  if (presskit.hasOwnProperty("presskit_file")) {
    if (presskit.presskit_file) {
      var file_name = presskit.presskit_file.nama;
      const b = Buffer.from(presskit.presskit_file.data, "base64");
      const timestamp = `presskit/${new Date().getTime()}`;
      var dir = `./public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      presskit["presskit_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Presskit in the database
  Presskit.create(presskit)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["presskitUuid"] = data.uuid;
          await PresskitI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Presskit.",
      });
    });
};

// Retrieve all Presskit from the database.
exports.findAll = (req, res) => {
  const tipe = req.query.tipe;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;

  var condition = {
    [Op.and]: [
      tipe ? { tipe: tipe } : null,
      status ? { status: status } : null,
    ],
  };

  var condition_i18n = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { '$i18n.nama$': { [Op.like]: `%${search}%` } },
            { '$i18n.deskripsi$': { [Op.like]: `%${search}%` } },
            { '$presskit.presskit_file$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
    ],
  };

  var query =
    nopage == 1
      ? Presskit.findAll({
        where: condition,
        include: [
          {
            model: PresskitI18n,
            as: 'i18n',
            where: condition_i18n,
          }
        ],
        order: [["updatedAt", "DESC"]],
      })
      : Presskit.findAndCountAll({
        where: condition,
        include: [
          {
            model: PresskitI18n,
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
          err.message || "Some error occurred while retrieving presskit.",
      });
    });
};

// Find a single Presskit with an uuid
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;

  Presskit.findOne({
    where: { uuid: uuid },
    include: [
      {
        model: PresskitI18n,
        as: 'i18n',
      }
    ]
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Presskit with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Presskit with uuid=" + uuid,
      });
    });
};

// Update a Presskit by the uuid in the request
exports.update_form = async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    const uuid = req.params.uuid;
    const { i18n, ...presskit } = req.body;
    Presskit.findByPk(uuid)
      .then(async (data) => {
        if (data == null) {
          res.status(404).send({
            message: "Error updating Presskit with uuid=" + uuid,
          });
        } else {
          if (req.file != null) {
            if (data.presskit_file != null && data.presskit_file != null) {
              var dir = data.presskit_file.split("/");
              console.log("dir", dir);
              const rm_path = `public/uploads/${dir[0]}/${dir[1]}`;
              fs.rm(rm_path, { recursive: true }, (err) => {
                if (err) {
                  console.log("err : ", err);
                }
              });
            }
            const { path } = req.file;
            presskit["presskit_file"] = path.replace('public/uploads/', '');
          }
          data.update(presskit);
          if (i18n != null) {
            for (var [key, value] of Object.entries(i18n)) {
              const [obj, created] = await PresskitI18n.findOrCreate({
                where: { presskitUuid: uuid, lang: key },
                defaults: value
              });
              if (!created) {
                obj.update(value);
              }
            }
            await data.reload({ include: 'i18n' });
          }
          res.send({
            message: "Presskit was updated successfully.",
            data: data,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Presskit.",
        });
      });
  });
}

// Update a Presskit by the uuid in the request
exports.update = async (req, res) => {
  const uuid = req.params.uuid;

  const { i18n, ...presskit } = req.body;
  if (presskit.hasOwnProperty("presskit_file")) {
    if (presskit.presskit_file) {
      var file_name = presskit.presskit_file.nama;
      const b = Buffer.from(presskit.presskit_file.data, "base64");
      const timestamp = `presskit/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      presskit["presskit_file"] = `${timestamp}/${file_name}`;
    } else {
      delete presskit.presskit_file;
    }
  }
  Presskit.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Presskit with uuid=" + uuid,
        });
      } else {
        if (presskit.presskit_file != null && data.presskit_file != null) {
          var dir = data.presskit_file.split("/");
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(presskit);

        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await PresskitI18n.findOrCreate({
              where: { presskitUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Presskit was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Presskit with uuid=" + uuid,
      });
    });
};

// Delete a Presskit with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Presskit.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Presskit with uuid=" + uuid,
        });
      } else {
        if (data.presskit_file != null) {
          var dir = data.presskit_file.split("/");
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.destroy();
        res.send({
          message: "Presskit was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Presskit with uuid=" + uuid,
      });
    });
};

// Delete all Presskit from the database.
exports.deleteAll = (req, res) => {
  Presskit.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      var path = `public/uploads/presskit`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Presskit were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all presskit.",
      });
    });
};

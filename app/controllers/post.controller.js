//@ts-check
const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../models");
const Post = db.post;
const PostI18n = db.postI18n;
const Photo = db.photo;
const PhotoI18n = db.photoI18n;
const Info = db.info;
const InfoI18n = db.infoI18n;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createPost": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("updatedAt").exists(),
      ];
    }
    case "updatePost": {
      return [];
    }
  }
};
// Create and Save a new Post
exports.create = async (req, res) => {
  const tipe = req.params.tipe;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...post } = req.body;
  post["tipe"] = tipe;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `post-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      post["nama_file"] = `${timestamp}/${file_name}`;
    }
  }
  if (req.body.hasOwnProperty("dokumen_file")) {
    if (req.body.dokumen_file) {
      var file_name = req.body.dokumen_file.nama;
      const b = Buffer.from(req.body.dokumen_file.data, "base64");
      const timestamp = `post-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      post["dokumen_file"] = `${timestamp}/${file_name}`;
    }
  }

  // Save Post in the database
  Post.create(post)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["postUuid"] = data.uuid;
          await PostI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Post.",
      });
    });
};

// Retrieve all Post from the database.
exports.findAll = (req, res) => {
  const tipe = req.params.tipe;
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const status = req.query.status;

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
      ? Post.findAll({
        where: condition,
        include: [
          {
            model: PostI18n,
            as: 'i18n',
            where: condition_i18n,
          },
          {
            model: Photo,
            as: 'photo',
            include: [{
              model: PhotoI18n,
              as: 'i18n',
            }],
          },
          {
            model: Info,
            as: 'info',
            include: [{
              model: InfoI18n,
              as: 'i18n',
            }],
          }
        ],
        order: [["updatedAt", "DESC"]],
      })
      : Post.findAndCountAll({
        where: condition,
        include: [
          {
            model: PostI18n,
            as: 'i18n',
            where: condition_i18n,
          },
          {
            model: Photo,
            as: 'photo',
            include: [{
              model: PhotoI18n,
              as: 'i18n',
            }],
          },
          {
            model: Info,
            as: 'info',
            include: [{
              model: InfoI18n,
              as: 'i18n',
            }],
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
          err.message || "Some error occurred while retrieving post.",
      });
    });
};

// Find a single Post with an uuid
exports.findOne = (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  Post.findOne({
    where: { [Op.and]: [{ uuid: uuid }, { tipe: tipe }] },
    include: [
      {
        model: PostI18n,
        as: 'i18n',
      },
      {
        model: Photo,
        as: 'photo',
        include: [{
          model: PhotoI18n,
          as: 'i18n',
        }],
      },
      {
        model: Info,
        as: 'info',
        include: [{
          model: InfoI18n,
          as: 'i18n',
        }],
      }
    ]
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Post with uuid=" + uuid,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Post with uuid=" + uuid,
      });
    });
};

// Update a Post by the uuid in the request
exports.update = async (req, res) => {
  const tipe = req.params.tipe;
  const uuid = req.params.uuid;

  const { i18n, ...post } = req.body;
  post["tipe"] = tipe;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `post-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      post["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete post.nama_file;
    }
  }

  if (req.body.hasOwnProperty("dokumen_file")) {
    if (req.body.dokumen_file) {
      var file_name = req.body.dokumen_file.nama;
      const b = Buffer.from(req.body.dokumen_file.data, "base64");
      const timestamp = `post-${tipe}/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      post["dokumen_file"] = `${timestamp}/${file_name}`;
    } else {
      delete post.dokumen_file;
    }
  }
  Post.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Post with uuid=" + uuid,
        });
      } else {
        if (post.nama_file != null && data.nama_file != null) {
          var dir = data.nama_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        if (post.dokumen_file != null && data.dokumen_file != null) {
          var dir = data.dokumen_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.update(post);

        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await PostI18n.findOrCreate({
              where: { postUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
          await data.reload({ include: 'i18n' });
        }
        res.send({
          message: "Post was updated successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Post with uuid=" + uuid,
      });
    });
};

// Update a Post by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await Post.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Post with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Post with uuid=${uuid}. Maybe Post was not found or req.body is empty!`
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

// Delete a Post with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Post.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Post with uuid=" + uuid,
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
        if (data.dokumen_file != null) {
          var dir = data.dokumen_file.split("/");
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
        data.destroy();
        res.send({
          message: "Post was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Post with uuid=" + uuid,
      });
    });
};

// Delete all Post from the database.
exports.deleteAll = (req, res) => {
  const tipe = req.params.tipe;
  Post.destroy({
    where: { tipe: tipe },
    truncate: false,
  })
    .then((nums) => {
      var path = `public/uploads/post-${tipe}`;
      fs.rm(path, { recursive: true }, (err) => {
        if (err) {
          console.log("err : ", err);
        }
      });
      res.send({ message: `${nums} Post were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all post.",
      });
    });
};

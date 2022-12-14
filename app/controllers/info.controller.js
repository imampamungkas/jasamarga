//@ts-check
const db = require("../models");
const Op = db.Sequelize.Op;
const Info = db.info;
const InfoI18n = db.infoI18n;
const Page = db.page;

const { validationResult } = require("express-validator");


exports.validate = (method) => {
  switch (method) {
    case "createInfo": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("urutan").exists(),
      ];
    }
    case "updateInfo": {
      return [];
    }
  }
};
// Create and Save a new Info
exports.create = async (req, res) => {
  const postUuid = req.params.postUuid;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...info } = req.body;
  await Page.findOne({
    where: { slug: postUuid },
  }).then((data) => {
    info["pageSlug"] = postUuid;
  }).catch((err) => {
    info["postUuid"] = postUuid;
  })

  // Save Info in the database
  Info.create(info)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["infoUuid"] = data.uuid;
          await InfoI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Info.",
      });
    });
};

// Update a Info by the uuid in the request
exports.update = async (req, res) => {
  const postUuid = req.params.postUuid;
  const uuid = req.params.uuid;

  const { i18n, ...info } = req.body;
  Page.findOne({
    where: { slug: postUuid },
  }).then((data) => {
    info["pageSlug"] = postUuid;
  }).catch((err) => {
    info["postUuid"] = postUuid;
  })
  Info.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Info with uuid=" + uuid,
        });
      } else {
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await InfoI18n.findOrCreate({
              where: { infoUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
        }

        data.update(info).then(async (result) => {
          await result.reload({ include: 'i18n' });
          res.send({
            message: "Info was updated successfully.",
            data: result,
          });
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Info with uuid=" + uuid,
      });
    });
};

// Update a Info by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await Info.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Info with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Info with uuid=${uuid}. Maybe Info was not found or req.body is empty!`
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

// Delete a Info with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Info.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Info with uuid=" + uuid,
        });
      } else {
        data.destroy();
        res.send({
          message: "Info was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Info with uuid=" + uuid,
      });
    });
};

// Delete all Info from the database.
exports.deleteAll = (req, res) => {
  const postUuid = req.params.postUuid;
  Info.destroy({
    where: {
      [Op.or]: [
        { postUuid: postUuid },
        { pageSlug: postUuid },
      ],
    },
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Info were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all info.",
      });
    });
};

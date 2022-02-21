//@ts-check
const db = require("../models");
const Op = db.Sequelize.Op;
const Residential = db.residential;
const ResidentialI18n = db.residentialI18n;

const { validationResult } = require("express-validator");
const regexExpUuid = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;


exports.validate = (method) => {
  switch (method) {
    case "createResidential": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("urutan").exists(),
      ];
    }
    case "updateResidential": {
      return [];
    }
  }
};
// Create and Save a new Residential
exports.create = async (req, res) => {
  const postUuid = req.params.postUuid;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...residential } = req.body;
  if (regexExpUuid.test(postUuid)) {
    residential["postUuid"] = postUuid;
  } else {
    residential["pageSlug"] = postUuid;
  }

  // Save Residential in the database
  Residential.create(residential)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["residentialUuid"] = data.uuid;
          await ResidentialI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Residential.",
      });
    });
};

// Update a Residential by the uuid in the request
exports.update = async (req, res) => {
  const postUuid = req.params.postUuid;
  const uuid = req.params.uuid;

  const { i18n, ...residential } = req.body;
  if (regexExpUuid.test(postUuid)) {
    residential["postUuid"] = postUuid;
  } else {
    residential["pageSlug"] = postUuid;
  }
  Residential.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Residential with uuid=" + uuid,
        });
      } else {
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await ResidentialI18n.findOrCreate({
              where: { residentialUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
        }

        data.update(residential).then(async (result) => {
          await result.reload({ include: 'i18n' });
          res.send({
            message: "Residential was updated successfully.",
            data: result,
          });
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Residential with uuid=" + uuid,
      });
    });
};

// Update a Residential by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await Residential.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Residential with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Residential with uuid=${uuid}. Maybe Residential was not found or req.body is empty!`
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

// Delete a Residential with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  Residential.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Residential with uuid=" + uuid,
        });
      } else {
        data.destroy();
        res.send({
          message: "Residential was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Residential with uuid=" + uuid,
      });
    });
};

// Delete all Residential from the database.
exports.deleteAll = (req, res) => {
  const postUuid = req.params.postUuid;
  Residential.destroy({
    where: {
      [Op.or]: [
        { postUuid: postUuid },
        { pageSlug: postUuid },
      ],
    },
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Residential were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all residential.",
      });
    });
};

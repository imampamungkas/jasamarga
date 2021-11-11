//@ts-check
const db = require("../models");
const Op = db.Sequelize.Op;
const StatusTol = db.statusTol;
const StatusTolI18n = db.statusTolI18n;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");


exports.validate = (method) => {
  switch (method) {
    case "createStatusTol": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("urutan").exists(),
      ];
    }
    case "updateStatusTol": {
      return [];
    }
  }
};
// Create and Save a new StatusTol
exports.create = async (req, res) => {
  const postUuid = req.params.postUuid;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...statusTol } = req.body;
  statusTol["postUuid"] = postUuid;

  // Save StatusTol in the database
  StatusTol.create(statusTol)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["statusTolUuid"] = data.uuid;
          await StatusTolI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the StatusTol.",
      });
    });
};

// Update a StatusTol by the uuid in the request
exports.update = async (req, res) => {
  const postUuid = req.params.postUuid;
  const uuid = req.params.uuid;

  const { i18n, ...statusTol } = req.body;
  statusTol["postUuid"] = postUuid;
  StatusTol.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating StatusTol with uuid=" + uuid,
        });
      } else {
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await StatusTolI18n.findOrCreate({
              where: { statusTolUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
        }

        data.update(statusTol).then(async (result) => {
          await result.reload({ include: 'i18n' });
          res.send({
            message: "StatusTol was updated successfully.",
            data: result,
          });
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating StatusTol with uuid=" + uuid,
      });
    });
};

// Update a StatusTol by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await StatusTol.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`StatusTol with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update StatusTol with uuid=${uuid}. Maybe StatusTol was not found or req.body is empty!`
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

// Delete a StatusTol with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  StatusTol.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting StatusTol with uuid=" + uuid,
        });
      } else {
        data.destroy();
        res.send({
          message: "StatusTol was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting StatusTol with uuid=" + uuid,
      });
    });
};

// Delete all StatusTol from the database.
exports.deleteAll = (req, res) => {
  const postUuid = req.params.postUuid;
  StatusTol.destroy({
    where: {
      [Op.or]: [
        { postUuid: postUuid },
        { pageSlug: postUuid },
      ],
    },
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} StatusTol were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all statusTol.",
      });
    });
};

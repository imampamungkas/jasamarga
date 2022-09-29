//@ts-check
const db = require("../models");
const Op = db.Sequelize.Op;
const TopupTol = db.topupTol;
const TopupTolI18n = db.topupTolI18n;

const { validationResult } = require("express-validator");


exports.validate = (method) => {
  switch (method) {
    case "createTopupTol": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("urutan").exists(),
      ];
    }
    case "updateTopupTol": {
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

  const { i18n, ...topupTol } = req.body;
  topupTol["postUuid"] = postUuid;

  // Save StatusTol in the database
  TopupTol.create(topupTol)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["topupTolUuid"] = data.uuid;
          await TopupTolI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating Data.",
      });
    });
};

// Update a StatusTol by the uuid in the request
exports.update = async (req, res) => {
  const postUuid = req.params.postUuid;
  const uuid = req.params.uuid;

  const { i18n, ...topupTol } = req.body;
  topupTol["postUuid"] = postUuid;
  TopupTol.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating Data with uuid=" + uuid,
        });
      } else {
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await TopupTolI18n.findOrCreate({
              where: { topupTolUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
        }

        data.update(topupTol).then(async (result) => {
          await result.reload({ include: 'i18n' });
          res.send({
            message: "Data was updated successfully.",
            data: result,
          });
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating Data with uuid=" + uuid,
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

      var result = await TopupTol.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`Data with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update Data with uuid=${uuid}. Maybe Data was not found or req.body is empty!`
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

  TopupTol.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting Data with uuid=" + uuid,
        });
      } else {
        data.destroy();
        res.send({
          message: "Data was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting Data with uuid=" + uuid,
      });
    });
};

// Delete all StatusTol from the database.
exports.deleteAll = (req, res) => {
  const postUuid = req.params.postUuid;
  TopupTol.destroy({
    where: {
      [Op.or]: [
        { postUuid: postUuid },
        { pageSlug: postUuid },
      ],
    },
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Data were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Data.",
      });
    });
};

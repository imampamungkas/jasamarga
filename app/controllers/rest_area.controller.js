//@ts-check
const db = require("../models");
const Op = db.Sequelize.Op;
const RestArea = db.restArea;
const RestAreaI18n = db.restAreaI18n;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const regexExpUuid = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;


exports.validate = (method) => {
  switch (method) {
    case "createRestArea": {
      return [
        // body("nama").exists(),
        // body("deskripsi").exists(),
        // body("urutan").exists(),
      ];
    }
    case "updateRestArea": {
      return [];
    }
  }
};
// Create and Save a new RestArea
exports.create = async (req, res) => {
  const postUuid = req.params.postUuid;
  // Validate request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { i18n, ...rest_area } = req.body;
  if (regexExpUuid.test(postUuid)) {
    rest_area["postUuid"] = postUuid;
  } else {
    rest_area["pageSlug"] = postUuid;
  }

  // Save RestArea in the database
  RestArea.create(rest_area)
    .then(async (data) => {
      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          i18n[i]["restAreaUuid"] = data.uuid;
          await RestAreaI18n.create(i18n[i]);
        }
        await data.reload({ include: 'i18n' });
      }
      res.send(data);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the RestArea.",
      });
    });
};

// Update a RestArea by the uuid in the request
exports.update = async (req, res) => {
  const postUuid = req.params.postUuid;
  const uuid = req.params.uuid;

  const { i18n, ...rest_area } = req.body;
  if (regexExpUuid.test(postUuid)) {
    rest_area["postUuid"] = postUuid;
  } else {
    rest_area["pageSlug"] = postUuid;
  }
  RestArea.findByPk(uuid)
    .then(async (data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error updating RestArea with uuid=" + uuid,
        });
      } else {
        if (i18n instanceof Array && i18n.length > 0) {
          for (var i = 0; i < i18n.length; i++) {
            const { lang, ...trans } = i18n[i];
            const [obj, created] = await RestAreaI18n.findOrCreate({
              where: { restAreaUuid: uuid, lang: lang },
              defaults: trans
            });
            if (!created) {
              obj.update(trans);
            }
          }
        }

        data.update(rest_area).then(async (result) => {
          await result.reload({ include: 'i18n' });
          res.send({
            message: "RestArea was updated successfully.",
            data: result,
          });
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error updating RestArea with uuid=" + uuid,
      });
    });
};

// Update a RestArea by the uuid in the request
exports.updateBulk = async (req, res) => {
  const data = req.body.data;
  let messages = [];
  if (data instanceof Array && data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      const uuid = data[i].uuid;
      delete data[i].uuid;

      var result = await RestArea.update(data[i], {
        where: { uuid: uuid },
      });
      if (result[0] > 0) {
        messages.push(`RestArea with uuid ${uuid} was updated successfully.`);
      } else {
        messages.push(
          `Cannot update RestArea with uuid=${uuid}. Maybe RestArea was not found or req.body is empty!`
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

// Delete a RestArea with the specified uuid in the request
exports.delete = (req, res) => {
  const uuid = req.params.uuid;

  RestArea.findByPk(uuid)
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error deleting RestArea with uuid=" + uuid,
        });
      } else {
        data.destroy();
        res.send({
          message: "RestArea was deleted successfully.",
          data: data,
        });
      }
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: "Error deleting RestArea with uuid=" + uuid,
      });
    });
};

// Delete all RestArea from the database.
exports.deleteAll = (req, res) => {
  const postUuid = req.params.postUuid;
  RestArea.destroy({
    where: {
      [Op.or]: [
        { postUuid: postUuid },
        { pageSlug: postUuid },
      ],
    },
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} RestArea were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all rest_area.",
      });
    });
};

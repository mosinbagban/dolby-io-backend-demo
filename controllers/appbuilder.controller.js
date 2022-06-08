const db = require("../models");
const Appbuilder = db.appbuilder;

// Create and Save a new Appbuilder
exports.create = (req, res) => {
  // Validate request
  if (!req.body.appname) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Appbuilder
  const appbuilder = new Appbuilder({
    appname: req.body.appname,
    description: req.body.description,
    themecolor: req.body.themecolor ? req.body.themecolor: '#232020' ,
    published: req.body.published ? req.body.published : false
  });

  // Save Appbuilder in the database
  appbuilder
    .save(appbuilder)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Appbuilder."
      });
    });
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const appname = req.query.appname;
  var condition = appname ? { appname: { $regex: new RegExp(appname), $options: "i" } } : {};

  Appbuilder.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving appbuilders."
      });
    });
};

// Find a single Appbuilder with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Appbuilder.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Appbuilder with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Appbuilder with id=" + id });
    });
};

// Update a Appbuilder by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Appbuilder.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Appbuilder with id=${id}. Maybe Appbuilder was not found!`
        });
      } else res.send({ message: "Appbuilder was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Appbuilder with id=" + id
      });
    });
};

// Delete a Appbuilder with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Appbuilder.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Appbuilder with id=${id}. Maybe Appbuilder was not found!`
        });
      } else {
        res.send({
          message: "Appbuilder was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Appbuilder with id=" + id
      });
    });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Appbuilder.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Tutorials were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all appbuilders."
      });
    });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  Appbuilder.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving appbuilders."
      });
    });
};

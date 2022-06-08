module.exports = app => {
  const appbuilders = require("../controllers/appbuilder.controller.js");

  var router = require("express").Router();

  // Create a new Appbuilder
  router.post("/", appbuilders.create);

  // Retrieve all Tutorials
  router.get("/", appbuilders.findAll);

  // Retrieve all published Tutorials
  router.get("/published", appbuilders.findAllPublished);

  // Retrieve a single Appbuilder with id
  router.get("/:id", appbuilders.findOne);

  // Update a Appbuilder with id
  router.put("/:id", appbuilders.update);

  // Delete a Appbuilder with id
  router.delete("/:id", appbuilders.delete);

  // Create a new Appbuilder
  router.delete("/", appbuilders.deleteAll);

  app.use("/api/appbuilders", router);
};

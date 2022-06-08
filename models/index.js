const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.appbuilder = require("./appbuilder.model.js")(mongoose);

module.exports = db;

// const appbuilderDB ={}
// appbuilderDB.mongoose = mongoose;
// appbuilderDB.url = dbConfig.url;
// appbuilderDB.tutorials = require("./appbuilder.model.js")(mongoose);

// module.exports = appbuilderDB;

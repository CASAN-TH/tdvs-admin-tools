'use strict'

const mongoose = require('mongoose');

module.exports.connection = function (cb) {
    var MONGODB_URI = process.env.MONGO_DB_URI || process.env.MONGODB_URI || process.env.MONGODB_URI_TEST || "mongodb://tvdsowner:covid1920@34.87.182.146:27017/thamdata"
    // MONGODB_URI = "mongodb://localhost:27017/database";
    // mongoose.set('debug', process.env.MONGO_DB_URI || process.env.MONGODB_URI ? false : true);
    var db = mongoose.connect(MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
        console.log(MONGODB_URI);
        if (err) {
            console.log("MongoDB Notconnected..." + err);
        } else {
            if (cb) {
                cb()
            } else {
                console.log("MongoDB Connected...");
            }
        }

    });

    // var glob = require('glob'),
    //     path = require('path');

    // glob.sync(path.join(__dirname, '../modules/**/models/*.js')).forEach(function (file) {
    //     require(path.resolve(file));
    // });

    return db;
}

module.exports.dropDatabase = function (cb) {
    mongoose.connection.db.dropDatabase(function () {
        if (cb) cb()
    });
}

module.exports.disconnect = function (cb) {
    mongoose.disconnect(function () {
        if (cb) cb()
    });
}

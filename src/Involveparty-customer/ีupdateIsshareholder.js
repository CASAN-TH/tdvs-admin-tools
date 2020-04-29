'use strict'

const db = require('../config/mongoose');
const mongoose = require('mongoose');
const involvedPartySchema = require('./models/involvedParty.model');
const tvdscustomerSchema = require('./models/tvdscustomer.model');
const InvolvedParty = require('../modules/involvedparty');
const Tvdscustomer = require('../modules/tvdscustomer');

(async() => {

    try {
        await db.connection();

        var InvolvedPartyCol = mongoose.model('Involvedparty');
        var TvdscustomerCol = mongoose.model('Tvdscustomer');

        // Query 
        var customerQuery = {};
        

        var data, row;
        var custQueryData = await TvdscustomerCol.find(customerQuery);

        console.log(`Total Delivery member : ${custQueryData.length}`);

        for ([row, data] of custQueryData.entries()) {
            try {
                var ipQuery = {};
                ipQuery.personalInfo = {};

                ipQuery.personalInfo.firstNameThai = custQueryData.firstName;
                ipQuery.personalInfo.lastNameThai = custQueryData.lastName;
                var ipQueryData = await InvolvedParty.find(ipQuery);

                if (!ipQueryData) continue;

                var ipData = new InvolvedParty();
                ipData.update(ipQueryData);

                custQueryData.isShareHolder = ipData.isShareholder();
                
                // update

                
            } catch(err) {
                console.log(err);
                continue;
            }
        }


        db.disconnect();
    } catch (err) {
        db.disconnect();
        console.log(err);
    }


})();


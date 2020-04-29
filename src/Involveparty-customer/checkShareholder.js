'use strict'

const db = require('../config/mongoose');
const mongoose = require('mongoose');
const involvedPartySchema = require('./models/involvedParty.model');
const tvdscustomerSchema = require('./models/tvdscustomer.model');
const InvolvedParty = require('../modules/involvedparty');
const Tvdscustomer = require('../modules/tvdscustomer');

(async() => {
    // Command line argument
    // node ./src/...                               --> update all tvdscustomer
    // node ./src/... "startdate"                   --> update by create/update at startdate
    // node ./src/... "startdate" "enddate"         --> update by create/update start at startdate end at enddate

    var startDate = null;
    var endDate = null;
    if (process.argv.length === 3) {
        startDate = new Date(process.argv[2]);
        endDate = new Date(process.argv[2]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (isNaN(startDate) || isNaN(endDate)) {
            console.log("ERROR : Date format");
            return;
        }
    } else if (process.argv.length === 4) {
        startDate = new Date(process.argv[2]);
        endDate = new Date(process.argv[3]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (isNaN(startDate) || isNaN(endDate)) {
            console.log("ERROR : Date format");
            return;
        }
    }
    
    //console.log(startDate);
    //console.log(endDate);
    //return;
    // ------------------------- END ARGUMENT PART -------------------------

    try {
        await db.connection();

        var InvolvedPartyCol = mongoose.model('Involvedparty');
        var TvdscustomerCol = mongoose.model('Tvdscustomer');

        var filter = {};
        if (startDate) {
            filter = {
                $or : [
                    {
                    created: {$gte: startDate, $lt: endDate}
                    },
                    {
                    updated: {$gte: startDate, $lt: endDate}
                    }
                ]
            };
        }
       
        var data, row;
        var updateNum = 0;
        var noUpdateNum = 0;
        var filterData = await TvdscustomerCol.find(filter);

        console.log(`Total Filter Data : ${filterData.length}`);
        // console.log(JSON.stringify(filterData));

        for ([row, data] of filterData.entries()) {
            try {
                // Query by firstname and lastname
                // !!!!!!  ?? should query by person id or mobile number ?

                var ipQuery = {
                    "personalInfo.firstNameThai": data.firstName,
                    "personalInfo.lastNameThai": data.lastName
                };
                
                var ipQueryData = await InvolvedPartyCol.find(ipQuery);

                if (ipQueryData.length === 0) continue;

                // if (ipQueryData.length > 1) {
                //     console.log(ipQueryData.length);
                //     console.log(ipQueryData[0].personalInfo.firstNameThai);
                //     console.log(ipQueryData[1].personalInfo.firstNameThai);
                // }
                
                // console.log(JSON.stringify(ipQueryData));

                // !!!!!! if many row should do ??
                var ip = new InvolvedParty();
                ip.update(ipQueryData[0]);

                var bShareholder = ip.isShareholder()

                // Change isShareHolder
                if (data.isShareHolder != bShareholder) {
                    // update
                    data.isShareHolder = bShareholder;
                    await data.save();
                    console.log(`row ${row} update shareholder ${data.isShareHolder} name ${data.firstName} ${data.lastName} `);
                    updateNum++;
                } else {
                    // console.log(`row ${row} No update shareholder ${data.isShareHolder} name ${data.firstName} ${data.lastName} `);
                    noUpdateNum++;
                }
               
                // console.log(`row : ${row}`);
                // console.log("--- Involve party ----");
                // console.log(JSON.stringify(ip));
                // console.log("--- tvds customer update ---");
                // console.log(JSON.stringify(data));
            } catch(err) {
                console.log(err);
                continue;
            }
        }
        console.log(`Total Update ${updateNum} no update ${noUpdateNum}`);
        db.disconnect();
    } catch (err) {
        db.disconnect();
        console.log(err);
    }


})();


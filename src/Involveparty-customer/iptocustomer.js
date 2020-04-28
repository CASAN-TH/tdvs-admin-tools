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

        var query = {
            "membership.activity": "delivery" 
        };

        var data, row;
        var queryData = await InvolvedPartyCol.find(query);

        console.log(`Total Delivery member : ${queryData.length}`);
        for ([row, data] of queryData.entries()) {
            try {
        
                // console.log(JSON.stringify(data));

                var ip = new InvolvedParty();
                ip.update(data);

                var customer = new Tvdscustomer();
                customer.fromInvolvedParty(ip);
                
                console.log(JSON.stringify(customer));
                var newTvdscustomer = new TvdscustomerCol(customer);
                await newTvdscustomer.save();
                console.log(`save success row : ${row} -- ${customer.firstName}`);
            } catch(err) {
                console.log(err);
                //continue;
            }
        }


        db.disconnect();
    } catch (err) {
        db.disconnect();
        console.log(err);
    }


})();


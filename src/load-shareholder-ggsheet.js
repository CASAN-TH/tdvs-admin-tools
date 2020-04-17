'use strict'

// ?? credential only read data from google sheet 100 rows in 100 second

const { GoogleSpreadsheet } = require('google-spreadsheet');
const cred = require('./thamturakit-data-center-credential.json');
const request = require('request');
const utils = require('./utils');
const tvdsService = require('./tvds-service');

// Delivery sheet 
const DELIVERY_GGSHEET_ID = '1hGcUIWXT9YeZC2Gy9XVYGxlC3KsKH_JBoQbToG6SNFw';
const DELIVERY_SHEET_ID = 0;
// const URL_POST = "https://tvds-service.herokuapp.com/api/involvedPartys";
// const URL_POST = "http://localhost:3000/api/involvedPartys";

(async() => {

    // connect to googlet sheet
    const doc = new GoogleSpreadsheet(DELIVERY_GGSHEET_ID);
    await doc.useServiceAccountAuth(cred);
  
    // First step must always loadInFo() from google sheet
    await doc.loadInfo();

    // select sheet
    const sheet = doc.sheetsById[DELIVERY_SHEET_ID];

    console.log("Total data rows : " + sheet.rowCount);

    
      
    var item, index;
    var involvedParty;
    var dataReturn, bodyReturn, objID;

    // Get All data from google sheet
    var dataRow = await sheet.getRows();
    // var dataRow = await sheet.getRows({limit:1, offset:1024});
    // var dataRow = await sheet.getRows({offset:1024});

    for ([index, item] of dataRow.entries()) {
        try {

            if (!item.shareholder_id) continue;

            // Convert to object
            involvedParty = await toInvoledParty(item);

            //console.log("--involved party--");
            //console.log(involvedParty);
   
            // Query firstanme and lastname to database
            bodyReturn = await tvdsService.sendQuery(involvedParty.personalInfo.firstNameThai,
                involvedParty.personalInfo.lastNameThai, "");

            dataReturn = JSON.parse(bodyReturn);

            // console.log(dataReturn);
            
            if (dataReturn.data) {
                // Updata data

                mergeInvoledParty(dataReturn.data, involvedParty);               
                objID = dataReturn.data._id;
                bodyReturn = await tvdsService.sendUpdate(objID, JSON.stringify(dataReturn.data));        

                console.log("--update -- row :"+ index + " " + dataReturn.data.personalInfo.firstNameThai);
                // console.log("--update merge involveparty");
                // console.log(dataReturn.data);
            } else {
                // Create new data
                bodyReturn = await tvdsService.sendCreate(JSON.stringify(involvedParty));
                console.log("--create -- row :" + index + " " + involvedParty.personalInfo.firstNameThai);
            }

            // console.log("--body return --");
            // console.log(bodyReturn);
        } catch (error) {
            console.log(error);
            continue;
        } 
    }
       

})();


/**
 * Convert Data GoogleSpreadSheetRow to InvolvedParty Javascript Ojbect
 * @param { GoogleSpreadSheetRow }item is row data of GoogleSpreadSheetRow
 * @returns Involed Party javacript object
 */
async function toInvoledParty(item) {
    var involvedParty = {};

    // shareholder_id is empty because empty firstname and lastname 
    if (!item.shareholder_id)   return involvedParty;

    involvedParty = {
        personalInfo : {
            titleThai: utils.cleanText(item.title),
            firstNameThai: utils.cleanText(item.firstname),
            lastNameThai: utils.cleanText(item.lastname)
        },
        registeredAddress : {
            addressLine1: utils.cleanText(item.address) + ' ' + utils.cleanText(item.soi),
            addressStreet: utils.cleanText(item.street),
            addressSubDistrict: utils.cleanText(item.subdistrict),
            addressDistrict: utils.cleanText(item.district),
            addressProvince: utils.cleanText(item.province),
            addressPostalCode: utils.cleanText(item.postalcode),
        },
        membership: [
            {
                activity: "shareholder",
                memberReference: item.shareholder_id
            }
        ]
    };

    // ID CARD
    if (item.idcard) {
        var idcard = utils.cleanText(item.idcard);
        idcard = idcard.replace(/(-|\s)/g, "");
        involvedParty.taxID = idcard;
        // console.log(idcard);
    }

    involvedParty.directContact = [];

    // Mobile number
    if (item.phone_number) {
        
        var contactType = "";

        var phone = utils.cleanText(item.phone_number); // clean invisible text
        phone = phone.replace(/(-|\s)/g, "");           // Remove - and space
        var phoneArr = phone.split(",");                // Split phone number "0123456789, 023501234";

        // select each phone number and push to array of directContact
        var x;
        for (x of phoneArr) {
            // Empty
            if (x.length == 0) continue;

            switch (x.length) {
                case 10: contactType = "mobile";             
                case 9: contactType = "home"                
                default: contactType = "other" ;        // Don't know        
            }

            // Add involveParty
            involvedParty.directContact.push(
                {
                    method: contactType,
                    value: x
                });
        }

    }
         
    // Email
    if (item.email) {
        involvedParty.directContact.push(
            {
                method: "email", 
                value: item.email
            });
    }

    return involvedParty;
}

/**
 * merge involvedParty data 
 * merge newData to oldData
 * @param {*} oldData
 * @param {*} newData
 */
async function mergeInvoledParty(oldData, newData) {
    oldData.taxID = newData.taxID;
    oldData.personalInfo.titleThai = newData.personalInfo.titleThai
    oldData.personalInfo.firstNameThai= newData.personalInfo.firstNameThai;
    oldData.personalInfo.lastNameThai = newData.personalInfo.lastNameThai;

    if (!oldData.registeredAddress) oldData.registeredAddress = {};

    oldData.registeredAddress.addressLine1 = newData.registeredAddress.addressLine1;
    oldData.registeredAddress.addressStreet = newData.registeredAddress.addressStreet;
    oldData.registeredAddress.addressSubDistrict = newData.registeredAddress.addressSubDistrict;
    oldData.registeredAddress.addressDistrict = newData.registeredAddress.addressDistrict;
    oldData.registeredAddress.addressProvince = newData.registeredAddress.addressProvince;
    oldData.registeredAddress.addressPostalCode = newData.registeredAddress.addressPostalCode;

    var index, x;
    // Find shareholder membership
    index = oldData.membership.findIndex((value, index, array) => {
        return value.activity === "shareholder";
    });
    
    if (index >= 0) {
        // update membership reference
        //console.log(index);       
        oldData.membership[index].memberReference = newData.membership[0].memberReference;
    } else {
        // Add new membership
        oldData.membership.push(newData.membership);
    }
    
    // -------- Direct contact -----------
    if (!newData.directContact) return;

    if (!oldData.directContact) oldData.directContact = [];

    // Find phone number : mobile, home, other  and email  
    for (x of newData.directContact) {        
        // Find number
        index = oldData.directContact.findIndex((value, index, array) => {
            return value.value === x.value;
        });
        // console.log(index);
        // Add new number
        if (index < 0) oldData.directContact.push(x);
    }
}
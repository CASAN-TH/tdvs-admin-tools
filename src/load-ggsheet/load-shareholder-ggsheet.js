'use strict'

// ?? credential only read data from google sheet 100 rows in 100 second

const { GoogleSpreadsheet } = require('google-spreadsheet');
const cred = require('./thamturakit-data-center-credential.json');
const utils = require('./utils');
const tvdsService = require('./tvds-service');
const InvolvedParty = require('../modules/involvedparty');

// Delivery sheet 
const DELIVERY_GGSHEET_ID = '1hGcUIWXT9YeZC2Gy9XVYGxlC3KsKH_JBoQbToG6SNFw';
const DELIVERY_SHEET_ID = 0;

(async() => {
    // Command line argument
    // node ./src/... offset limit
    // offset is start with index
    // limit is total row to be load
    // limit 0 is load all
    var offset = 0;
    var limit = 0;
    process.argv.forEach((value, index, array) => {
        if (index == 2) offset = parseInt(value);
        if (index == 3) limit = parseInt(value);
    });

    // console.log(offset, limit);
    //return;
    
    // connect to googlet sheet
    const doc = new GoogleSpreadsheet(DELIVERY_GGSHEET_ID);
    await doc.useServiceAccountAuth(cred);
  
    // First step must always loadInFo() from google sheet
    await doc.loadInfo();

    // select sheet
    const sheet = doc.sheetsById[DELIVERY_SHEET_ID];

    console.log("Total data rows : " + sheet.rowCount);
    
    var x, item, index;
    var involvedParty, newInvolvedParty;
    var dataReturn, bodyReturn;
    var phone;

    console.log("Start row: " + offset);
    console.log("Download Total : " + limit);

    // Get All data from google sheet
    // var dataRow = await sheet.getRows();
    var dataRow = await sheet.getRows({limit: limit, offset: offset});
    // var dataRow = await sheet.getRows({offset:1024});

    for ([index, item] of dataRow.entries()) {
        try {

            if (!item.shareholder_id) continue;

            // Convert to object
            //involvedParty = await toInvoledParty(item);
            involvedParty = new InvolvedParty();
            await involvedParty.fromShareholder(item);
            phone = involvedParty.getMobileNumber();

            //console.log("--involved party--");
            //console.log(JSON.stringify(involvedParty));

            if (phone.length > 0) {
                for (x of phone) {  
                    // console.log(x.value);
                    // Query firstanme and lastname and all mobile number
                    bodyReturn = await tvdsService.sendQuery(involvedParty.personalInfo.firstNameThai,
                    involvedParty.personalInfo.lastNameThai, x.value);
                    dataReturn = JSON.parse(bodyReturn);
                    if (dataReturn) break;
                }
            } else {
                // Query firstanme and lastname to database
                bodyReturn = await tvdsService.sendQuery(involvedParty.personalInfo.firstNameThai,
                            involvedParty.personalInfo.lastNameThai, "");
                dataReturn = JSON.parse(bodyReturn);
            }
        
            // console.log(bodyReturn);

            if (dataReturn.data) {
                // Updata data

                newInvolvedParty = new InvolvedParty();
                Object.assign(newInvolvedParty, dataReturn.data);
                newInvolvedParty.update(involvedParty);
                // console.log(newInvolvedParty);

                // mergeInvoledParty(dataReturn.data, involvedParty);               
                bodyReturn = await tvdsService.sendUpdate(dataReturn.data._id, 
                                                JSON.stringify(newInvolvedParty));        

                // console.log(bodyReturn);
                console.log("--update -- row :"+ index + " " + newInvolvedParty.personalInfo.firstNameThai);
                // console.log("--update merge involveparty");
                // console.log(bodyReturn);
            } else {
                // Create new data
                bodyReturn = await tvdsService.sendCreate(JSON.stringify(involvedParty));
                console.log("--create -- row :" + index + " " + involvedParty.personalInfo.firstNameThai);
            }

            //console.log("--body return --");
            //console.log(bodyReturn);
        } catch (error) {
            console.log(error);
            continue;
        } 
    }      
})();


// /**
//  * Convert Data GoogleSpreadSheetRow to InvolvedParty Javascript Ojbect
//  * @param { GoogleSpreadSheetRow }item is row data of GoogleSpreadSheetRow
//  * @returns Involed Party javacript object
//  */
// async function toInvoledParty(item) {
//     var involvedParty = {};

//     // shareholder_id is empty because empty firstname and lastname 
//     if (!item.shareholder_id)   return involvedParty;

//     involvedParty = {
//         personalInfo : {
//             titleThai: utils.cleanText(item.title),
//             firstNameThai: utils.cleanText(item.firstname),
//             lastNameThai: utils.cleanText(item.lastname)
//         },
//         registeredAddress : {
//             addressLine1: utils.cleanText(item.address) + ' ' + utils.cleanText(item.soi),
//             addressStreet: utils.cleanText(item.street),
//             addressSubDistrict: utils.cleanText(item.subdistrict),
//             addressDistrict: utils.cleanText(item.district),
//             addressProvince: utils.cleanText(item.province),
//             addressPostalCode: utils.cleanText(item.postalcode),
//         },
//         membership: [
//             {
//                 activity: "shareholder",
//                 memberReference: item.shareholder_id
//             }
//         ]
//     };

//     // ID CARD
//     if (item.idcard) {
//         var idcard = utils.cleanText(item.idcard);
//         idcard = idcard.replace(/(-|\s)/g, "");
//         involvedParty.taxID = idcard;
//         // console.log(idcard);
//     }

//     involvedParty.directContact = [];

//     // Mobile number
//     if (item.phone_number) {
        
//         var contactType = "";

//         var phone = utils.cleanText(item.phone_number); // clean invisible text
//         phone = phone.replace(/(-|\s)/g, "");           // Remove - and space
//         var phoneArr = phone.split(",");                // Split phone number "0123456789, 023501234";

//         // select each phone number and push to array of directContact
//         var x;
//         for (x of phoneArr) {
//             // Empty
//             if (x.length == 0) continue;

//             switch (x.length) {
//                 case 10: 
//                     contactType = "mobile";             
//                     break;
//                 case 9: 
//                     contactType = "home";              
//                     break;
//                 default: 
//                     contactType = "other" ;        // Don't know        
//             }

//             // Add involveParty
//             involvedParty.directContact.push(
//                 {
//                     method: contactType,
//                     value: x
//                 });
//         }

//     }
         
//     // Email
//     if (item.email) {
//         involvedParty.directContact.push(
//             {
//                 method: "email", 
//                 value: item.email
//             });
//     }

//     return involvedParty;
// }

// /**
//  * merge involvedParty data 
//  * merge newData to oldData
//  * @param {*} oldData
//  * @param {*} newData
//  */
// async function mergeInvoledParty(oldData, newData) {
//     oldData.taxID = newData.taxID;
//     oldData.personalInfo.titleThai = newData.personalInfo.titleThai
//     oldData.personalInfo.firstNameThai= newData.personalInfo.firstNameThai;
//     oldData.personalInfo.lastNameThai = newData.personalInfo.lastNameThai;

//     if (!oldData.registeredAddress) oldData.registeredAddress = {};

//     oldData.registeredAddress.addressLine1 = newData.registeredAddress.addressLine1;
//     oldData.registeredAddress.addressStreet = newData.registeredAddress.addressStreet;
//     oldData.registeredAddress.addressSubDistrict = newData.registeredAddress.addressSubDistrict;
//     oldData.registeredAddress.addressDistrict = newData.registeredAddress.addressDistrict;
//     oldData.registeredAddress.addressProvince = newData.registeredAddress.addressProvince;
//     oldData.registeredAddress.addressPostalCode = newData.registeredAddress.addressPostalCode;

//     var index, x;
//     // Find shareholder membership
//     index = oldData.membership.findIndex((value, index, array) => {
//         return value.activity === "shareholder";
//     });
    
//     if (index >= 0) {
//         // update membership reference
//         //console.log(index);       
//         oldData.membership[index].memberReference = newData.membership[0].memberReference;
//     } else {
//         // Add new membership
//         oldData.membership.push(newData.membership);
//     }
    
//     // -------- Direct contact -----------
//     if (!newData.directContact) return;

//     if (!oldData.directContact) oldData.directContact = [];

//     // Find phone number : mobile, home, other  and email  
//     for (x of newData.directContact) {        
//         // Find number
//         index = oldData.directContact.findIndex((value, index, array) => {
//             return value.value === x.value;
//         });
//         // console.log(index);
//         // Add new number
//         if (index < 0) oldData.directContact.push(x);
//     }
// }
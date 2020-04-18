'use strict'

// ?? credential only read data from google sheet 100 rows in 100 second

const { GoogleSpreadsheet } = require('google-spreadsheet');
const cred = require('./thamturakit-data-center-credential.json');
// const request = require('request');
// const utils = require('./utils');
const tvdsService = require('./tvds-service');
const InvolvedParty = require('./involvedparty');

// Delivery sheet 
const DELIVERY_GGSHEET_ID = '1jhnR4pC7wa9R1QVSDLPVlFml3K_7k87XIrWKVSA4f_8';
const DELIVERY_SHEET_ID = 1181304633;

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

    // connect to googlet sheet
    const doc = new GoogleSpreadsheet(DELIVERY_GGSHEET_ID);
    await doc.useServiceAccountAuth(cred);
  
    // First step must always loadInFo() from google sheet
    await doc.loadInfo();

    // select sheet
    const sheet = doc.sheetsById[DELIVERY_SHEET_ID];

    console.log("Total data rows : " + sheet.rowCount);

    var x, index, item;
    var involvedParty, newInvolvedParty;
    var bodyReturn, dataReturn;
    var phone;

    console.log("Start row: " + offset);
    console.log("Download Total : " + limit);

    // Get All data from google sheet
    // index 0  variable for awesome table
    // index 1 start data
    // var dataRow = await sheet.getRows();
    var dataRow = await sheet.getRows({limit:limit, offset:offset});

    for ([index, item] of dataRow.entries()) {
        try {
            // Empty
            if (item.name == "") continue;

            // Convert to object
            // involvedParty = await toInvoledParty(item);
            involvedParty = new InvolvedParty();
            await involvedParty.fromDelivery(item);
            phone = involvedParty.getMobileNumber();

            //console.log("--involved party--");
            //console.log(involvedParty);
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
                // newInvolvedParty.directContact[0].value = "1234567890";
                // console.log(newInvolvedParty);

                bodyReturn = await tvdsService.sendUpdate( dataReturn.data._id, 
                                    JSON.stringify(newInvolvedParty));        
                
                // console.log(bodyReturn);
                console.log("--update -- row :"+ index + " " + newInvolvedParty.personalInfo.firstNameThai);
            //    console.log("--update merge involveparty");
            //    console.log(dataReturn.data);
            } else {
                 // Create new data
                // 
                bodyReturn = await tvdsService.sendCreate(JSON.stringify(involvedParty));
                // console.log(bodyReturn);
                console.log("--create -- row :" + index + " " + involvedParty.personalInfo.firstNameThai);
            }

        } catch (err) {
            console.log(err);
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
//     var involvedParty = {
//         personalInfo : {
//             titleThai: item.title,
//             firstNameThai: utils.cleanText(item.firstname),
//             lastNameThai: utils.cleanText(item.lastname)
//         },
//         contactAddress : {
//             addressLine1: utils.cleanText(item.address) + ' ' + utils.cleanText(item.soi),
//             addressStreet: utils.cleanText(item.street),
//             addressSubDistrict: utils.cleanText(item.subdistrict),
//             addressDistrict: utils.cleanText(item.district),
//             addressProvince: utils.cleanText(item.province),
//             addressPostalCode: item.postalcode,
//             latitude: item.Latitude,
//             longitude: item.Longtitude
//         },
//         membership: [
//             {
//                 activity: "delivery",
//                 memberReference: ""
//             }
//         ]
//     };

//     // Mobile 
//     // Remove - and space
//     if (item.phonenumber) {
//         var phone = utils.cleanText(item.phonenumber);
//         phone = phone.replace(/(-|\s)/g, "");
    
//         involvedParty.directContact = [];
//         involvedParty.directContact.push(
//             {
//                 method: "mobile", 
//                 value: phone
//             }
//         );
//     }
    
//     // Check isshareholder
//     if (item.isshareholder == "TRUE") {
//         involvedParty.membership.push(
//             {
//                 activity: "shareholder",
//                 memberReference: ""
//             }
//         );
//     }
//     return involvedParty;
// }
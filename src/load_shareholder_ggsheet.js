'use strict'

// ?? credential only read data from google sheet 100 rows in 100 second

const { GoogleSpreadsheet } = require('google-spreadsheet');
const cred = require('./thamturakit-data-center-credential.json');
const request = require('request');
const utils = require('./utils');

// Delivery sheet 
const DELIVERY_GGSHEET_ID = '1hGcUIWXT9YeZC2Gy9XVYGxlC3KsKH_JBoQbToG6SNFw';
const DELIVERY_SHEET_ID = 0;
const URL_POST = "https://tvds-service.herokuapp.com/api/involvedPartys";
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

    // Get All data from google sheet
    // index 0  variable for awesome table
    // index 1 start data
    try {
        //var data = await sheet.getRows();
        var data = await sheet.getRows({limit:5, offset:0});
        // var data = await sheet.loadCells();
        // var cell = sheet.getCell(1, 0);
        // console.log(cell.value);

        // Send post request to REST API
        await data.forEach(sendRequest);

        // TODO : update Flag in delivery google sheet
    } catch (error) {
        console.log(error);
    } 
})();

/**
 * Send Request to TVDS REST API 
 * @param {GoogleSpreadSheetRow} item 
 * @param {int} index 
 */
async function sendRequest(item, index) {

    // Empty name is not process
    if (item.shareholder_id == "") return;
    
    var involvedParty = await toInvoledParty(item);
    
    // console.log("latitude +", item.Latitude + "longitude + ", item.Longtitude);

    request.post(
        {
            url: URL_POST,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(involvedParty)
        },
        (err, res, body) => {
            if (err) {
                console.log("error : " + err.value);
            } else {
                var returnData = JSON.parse(res.body);
                console.log("status :" + res.statusCode);
                console.log(returnData.data.personalInfo.firstNameThai + " " 
                            + returnData.data.personalInfo.lastNameThai);
            }       
        }     
    );

    // console.log(JSON.stringify(involvedParty));
}

/**
 * Convert Data GoogleSpreadSheetRow to InvolvedParty Javascript Ojbect
 * @param { GoogleSpreadSheetRow }item is row data of GoogleSpreadSheetRow
 * @returns Involed Party javacript object
 */
async function toInvoledParty(item) {
    var involvedParty = {

        personalInfo : {
            titleThai: item.title,
            firstNameThai: utils.cleanText(item.firstname),
            lastNameThai: utils.cleanText(item.lastname)
        },
        registeredAddress : {
            addressLine1: utils.cleanText(item.address) + ' ' + utils.cleanText(item.soi),
            addressStreet: utils.cleanText(item.street),
            addressSubDistrict: utils.cleanText(item.subdistrict),
            addressDistrict: utils.cleanText(item.district),
            addressProvince: utils.cleanText(item.province),
            addressPostalCode: item.postalcode,
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

    // Mobile 
    // Remove - and space
    involvedParty.directContact = [];
    if (item.phone_number) {
        // console.log(typeof(item.phone_number));
        var phone = utils.cleanText(item.phone_number);
        phone = phone.replace(/(-|\s)/g, "");
        involvedParty.directContact.push(
            {
                method: "mobile", 
                value: phone
            }
        );
    }

    if (item.email) {
        involvedParty.directContact.push(
            {
                method: "email", 
                value: item.email
            }
        );
    }

    return involvedParty;
}
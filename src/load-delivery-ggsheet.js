'use strict'

// ?? credential only read data from google sheet 100 rows in 100 second

const { GoogleSpreadsheet } = require('google-spreadsheet');
const cred = require('./thamturakit-data-center-credential.json');

// Delivery sheet 
var DELIVERY_GGSHEET_ID = '1jhnR4pC7wa9R1QVSDLPVlFml3K_7k87XIrWKVSA4f_8';
var DELIVERY_SHEET_ID = 1181304633;

(async() => {

    // connect to googlet sheet
    const doc = new GoogleSpreadsheet(DELIVERY_GGSHEET_ID);
    await doc.useServiceAccountAuth(cred);
  
    await doc.loadInfo();

    const sheet = doc.sheetsById[DELIVERY_SHEET_ID];

    var i, data;
    var total = sheet.rowCount;
    var involvedParty;

    console.log(total);

    //index 0  variable for awesome table
    //index 1 start data
    for (i = 1; i <= total; i++) {

        // Get data only one row
        data = await sheet.getRows({limit: 1, offset: i});

        // Test save update
        if (data[0].update == "Test") {
            console.log("row aleready update");
            continue;
        }

        // TODO : split name to firstname and lastname
        involvedParty = {
            personalInfo : {
                firstNameThai: data[0].name,
            },
            // TODO : addressLine1 must combine address and soi in google sheet
            contactAddress : {
                addressLine1: data[0].address,
                addressStreet: data[0].street,
                addressSubDistrict: data[0].subdistrict,
                latitude: data[0].Latitude,
                longtitude: data[0].Longtitude
        }
    };

        //data[i].update = "Test";

        console.log(JSON.stringify(involvedParty));
        //console.log(data[i]);

        // await data[0].save();
  }
  
})();
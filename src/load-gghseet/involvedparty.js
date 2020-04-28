const utils = require('./utils');

// InvolvedParty keyword
const IP_TXT = {
    delivery: "delivery",
    shareholder: "shareholder",
    mobileNumber: "mobile",
    homeNumber: "home",
    otherNumber: "other",
    email: "email"
}

function InvolvedParty() {
    this.personalInfo = {};
    this.contactAddress = {};
    this.registeredAddress = {};
    this.membership = [];
    this.directContact = [];
    this.ipIPRelationship = [];
    this.bankAccount = [];
    this.taxID = "";

    /**
     * From delivery google sheet
     * Convert Data GoogleSpreadSheetRow to InvolvedParty Javascript Ojbect
     * @param { GoogleSpreadSheetRow } item is row data of GoogleSpreadSheetRow
     */
    this.fromDelivery = function(item) {
        this.personalInfo = {
            titleThai: item.title,
            firstNameThai: utils.cleanText(item.firstname),
            lastNameThai: utils.cleanText(item.lastname)
        };
        this.contactAddress = {
            addressLine1: utils.cleanText(item.address) + ' ' + utils.cleanText(item.soi),
            addressStreet: utils.cleanText(item.street),
            addressSubDistrict: utils.cleanText(item.subdistrict),
            addressDistrict: utils.cleanText(item.district),
            addressProvince: utils.cleanText(item.province),
            addressPostalCode: item.postalcode,
            latitude: item.Latitude,
            longitude: item.Longtitude
        };
        this.addDeliveryMemberShip("");

        if (item.phonenumber) {
            var phone = this.cleanPhoneNumber(item.phonenumber);
            this.addPhoneNumber(phone);
        }
    };

    /**
     * From shareholder google sheet
     * Convert Data GoogleSpreadSheetRow to InvolvedParty Javascript Ojbect
     * @param { GoogleSpreadSheetRow } item is row data of GoogleSpreadSheetRow
     */

    this.fromShareholder = function(item) {
        this.personalInfo = {
            titleThai: utils.cleanText(item.title),
            firstNameThai: utils.cleanText(item.firstname),
            lastNameThai: utils.cleanText(item.lastname)
        };
        this.registeredAddress = {
            addressLine1: utils.cleanText(item.address) + ' ' + utils.cleanText(item.soi),
            addressStreet: utils.cleanText(item.street),
            addressSubDistrict: utils.cleanText(item.subdistrict),
            addressDistrict: utils.cleanText(item.district),
            addressProvince: utils.cleanText(item.province),
            addressPostalCode: utils.cleanText(item.postalcode),
        },
        // Shareholder Membership
        this.addShareholderMemberShip(item.shareholder_id);

        // Bank account
        if (item.bankID) {
            this.bankAccount.push({
                bankID: item.bankID,
                bankAccountNumber: utils.cleanText(item.bankaccount),
                bankAccountName: utils.cleanText(item.bankaccount_name),
                activity: "",
                purpose: ""
            });
        }
    
        // ID CARD
        if (item.idcard) this.taxID = this.cleanTaxID(item.idcard);
     
        // Mobile number
        if (item.phone_number) {

            var number = this.cleanPhoneNumber(item.phone_number);
            // Split phone number "0123456789, 023501234";
            var phoneArr = number.split(",");                
    
            // select each phone number and push to array of directContact
            var x;
            for (x of phoneArr) this.addPhoneNumber(x);
        }
             
        // Email
        if (item.email) this.addEmail(item.email);
    };

    /**
     * clean phone number string : delect - and space
     * @param {string} str is phone number string
     */
    this.cleanPhoneNumber = function(txt) {
        if (txt) {
            return utils.cleanText(txt).replace(/(-|\s)/g, "");
        }
        return txt;
    };

    /**
     * phone type is mobile, home, other for insert directcontact
     * @param {string} str is phone number string
     */
    this.phoneType = function(str) {
        if (typeof(str) !== "string") str.toString();

        if (str.length == 0) return "";

        var type = "";
        switch (str.length) {
            case 10: 
                type = IP_TXT.mobileNumber;    
                break;
            case 9: 
                type = IP_TXT.homeNumber; 
                break;
            default: 
                type = IP_TXT.otherNumber ;        // Don't know        
        }
        return type;
    };

    /**
     * clean taxid : delete - and space
     * @param {string} str is tax id string
     */
    this.cleanTaxID = function(str) {
        if (str) {
            return utils.cleanText(str).replace(/(-|\s)/g, "");
            // console.log(idcard);
        }
        return "";
    };

    /**
     * add delivery membership
     * @param {string} ref is memberReference
     */
    this.addDeliveryMemberShip = function(ref) {
        this.membership.push({
            activity: IP_TXT.delivery,
            memberReference: ref
        });
    };

    /**
     * add shareholder field
     * @param {string} ref is MemberReference
     */
    this.addShareholderMemberShip = function(ref) {
        this.membership.push({
            activity: IP_TXT.shareholder,
            memberReference: ref
        });
    };

    /**
     * add direc contact field of mobile, home, other number
     * @param {string} 
     */
    this.addPhoneNumber = function(number) {
        if (number === "") return;
        this.directContact.push({
            method: this.phoneType(number), 
            value: number
        });
    };

    /**
     * Get all object in direct contact is mobile number
     */
    this.getMobileNumber = function() {
        if (this.directContact.length == 0)  return [];

        number = this.directContact.filter((value, index, array) => {
            return value.method === IP_TXT.mobileNumber;
        });

        return number;
    };

     /**
     * Get all object in direct contact is home number
     */
    this.getHomeNumber = function() {
        if (this.directContact.length == 0)  return [];

        number = this.directContact.filter((value, index, array) => {
            return value.method === IP_TXT.homeNumber;
        });

        return number;
    };

     /**
     * Get all object in direct contact is other number
     */
    this.getOtherNumber = function() {
        if (this.directContact.length == 0)  return [];

        number = this.directContact.filter((value, index, array) => {
            return value.method === IP_TXT.otherNumber;
        });

        return number;
    };

    /**
     * add direc contact field of email
     * @param {string} 
     */
    this.addEmail = function(email) {
        if (email === "") return;

        this.directContact.push({
            method: IP_TXT.email, 
            value: email
        });
    };

    /**
     * Get all object in direct contact is other number
     */
    this.getEmail = function() {
        if (this.directContact.length == 0)  return [];

        number = this.directContact.filter((value, index, array) => {
            return value.method === IP_TXT.email;
        });

        return number;
    };


    /**
     * update newData to this object
     * @param {InvolvedParty} newData
     */
    this.update = function(newData) {
        this.taxID = newData.taxID;
        Object.assign(this.personalInfo, newData.personalInfo);
        Object.assign(this.contactAddress, newData.contactAddress);
        Object.assign(this.registeredAddress, newData.registeredAddress);

        var i, x;
        // Membership
        for (x of newData.membership) {
            i = this.membership.findIndex((value, index, arrary) => {
                return value.activity === x.activity
            });
            
            if (i >= 0) this.membership[i].memberReference = x.memberReference;
            else this.membership.push(x);
        }

        // Direct Contact
        for (x of newData.directContact) {
            // Find number
            i = this.directContact.findIndex((value, index, array) => {
                return value.value === x.value;
            });
            // Add new number
            if (i < 0) this.directContact.push(x);
        }
    };
}

module.exports = InvolvedParty 

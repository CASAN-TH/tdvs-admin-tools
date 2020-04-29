function Tvdscustomer() {
    this.title = '';
    this.firstName = '';
    this.lastName = '';
    this.displayName = '';
    this.persanalId = '';
    this.isShareHolder = '';
    this.mobileNo1 = '';
    this.mobileNo2 = '';
    this.mobileNo3 = '';
    this.addressLine1 = '';
    this.addressStreet = '';
    this.addressSubDistrict = '';
    this.addressDistrict = '';
    this.addressProvince = '';
    this.addressPostCode = '';
    this.lineUserId = '';
    this.latitude = '';
    this.longitude = '';
    this.created = '';

    this.fromInvolvedParty = function(item) {
        if (!item) {
             return;       
        }

        this.title = item.personalInfo.titleThai;
        this.firstName = item.personalInfo.firstNameThai;
        this.lastName = item.personalInfo.lastNameThai;
        this.displayName = `${this.firstName} ${this.lastName}`;
        if (item.taxID) {
            this.persanalId = item.taxID;
        } else if (item.personalInfo.citizenId) {
            this.persanalId = item.personalInfo.citizenId;
        } else {
            this.persanalId = '';
        }
         
        this.isShareHolder = item.isShareholder();
       
        if (Object.keys(item.contactAddress).length > 0) {          // isempty object
            // console.log("In contact : " + item.contactAddress);
            this.addressLine1 = item.contactAddress.addressLine1;
            this.addressStreet = item.contactAddress.addressStreet;
            this.addressSubDistrict = item.contactAddress.addressSubDistrict;
            this.addressDistrict = item.contactAddress.addressDistrict;
            this.addressProvince = item.contactAddress.addressProvince;
            this.addressPostCode = item.contactAddress.addressPostalCode;
            this.latitude = item.contactAddress.latitude;
            this.longitude = item.contactAddress.longitude;
        } else {
            // console.log("In registered " + item.registeredAddress);
            this.addressLine1 = item.registeredAddress.addressLine1;
            this.addressStreet = item.registeredAddress.addressStreet;
            this.addressSubDistrict = item.registeredAddress.addressSubDistrict;
            this.addressDistrict = item.registeredAddress.addressDistrict;
            this.addressProvince = item.registeredAddress.addressProvince;
            this.addressPostCode = item.registeredAddress.addressPostalCode;
            this.latitude = item.registeredAddress.latitude;
            this.longitude = item.registeredAddress.longitude;
        }

        // Get only one of mobile number 
        var phone = item.getMobileNumber();
        this.mobileNo1 = (phone.length > 0) ? phone[0].value : '';

        phone = item.getHomeNumber();
        this.mobileNo2 = (phone.length > 0) ? phone[0].value : '';

        phone = item.getOtherNumber()
        this.mobileNo3 = (phone.length > 0) ? phone[0].value : '';

        this.lineUserId = item.getLineUserId();

        this.created = item.created;
        if (item.updated) {
            this.updated = item.updated;
        }

        // console.log(item.created);
        // console.log(this.created);
    };
}

module.exports = Tvdscustomer;


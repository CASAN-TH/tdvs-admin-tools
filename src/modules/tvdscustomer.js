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

    this.fromInvolvedParty = function(item) {
        if (!item) {
             return;       
        }

        this.title = item.personalInfo.title;
        this.firstName = item.personalInfo.firstNameThai;
        this.lastName = item.personalInfo.lastNameThai;
        this.displayName = `${this.firstName} ${this.lastName}`;
        this.persanalId = item.taxID;
        this.isShareHolder = item.isShareholder();

        this.addressLine1 = item.contactAddress.addressLine1;
        this.addressStreet = item.contactAddress.addressStreet;
        this.addressSubDistrict = item.contactAddress.addressSubDistrict;
        this.addressDistrict = item.contactAddress.addressDistrict;
        this.addressProvince = item.contactAddress.addressProvince;
        this.addressPostCode = item.contactAddress.addressPostCode;
        this.latitude = item.contactAddress.latitude;
        this.longitude = item.contactAddress.longitude;

        //this.mobileNo1 = item.getMobileNumber();
        //this.mobileNo2 = item.getHomeNumber();
        //this.mobileNo3 = item.getOtherNumber();

        this.lineUserId = item.getLineUserId();
    };
}

module.exports = Tvdscustomer;


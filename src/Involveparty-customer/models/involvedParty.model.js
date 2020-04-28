"use strict";
// use model
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var InvolvedpartySchema = new Schema({
  involedPartyID: {
    type: String,
  },
  involvedPartyType: {
    type: String,
  },
  taxID: {
    type: String,
  },
  otherUniqueID: {
    type: String,
  },
  otherUniqueIDType: {
    type: String,
  },
  nationality: {
    type: String,
  },
  countryOfResidence: {
    type: String,
  },
  documentActive: {
    type: Boolean,
  },
  relationType: {
    type: String,
    enum: ["member", "driver", "shareholder", "supplier"],
    default: "member",
  },
  personalInfo: {
    type: {
      title: {
        type: String,
      },
      titleThai: {
        type: String,
      },
      firstName: {
        type: String,
      },
      firstNameThai: {
        type: String,
      },
      middleName: {
        type: String,
      },
      middleNameThai: {
        type: String,
      },
      lastName: {
        type: String,
      },
      lastNameThai: {
        type: String,
      },
      luId: {
        type: String,
      },
      citizenId: {
        type: String,
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
      },
    },
  },
  directContact: {
    type: [
      {
        method: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
  },
  juristicPersonInfo: {
    type: {
      juristicID: {
        type: String,
      },
      juristicRegisteredDate: {
        type: Date,
      },
      companyName: {
        type: String,
      },
      companyNameThai: {
        type: String,
      },
      BusinessType: {
        type: [String],
      },
    },
  },
  registeredAddress: {
    type: {
      addressLine1: {
        type: String,
      },
      addressStreet: {
        type: String,
      },
      addressSubDistrict: {
        type: String,
      },
      addressDistrict: {
        type: String,
      },
      addressProvince: {
        type: String,
      },
      addressCountry: {
        type: String,
      },
      addressPostalCode: {
        type: String,
      },
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
    },
  },
  contactUseRegAddress: {
    type: Boolean,
  },
  contactAddress: {
    type: {
      addressLine1: {
        type: String,
      },
      addressStreet: {
        type: String,
      },
      addressSubDistrict: {
        type: String,
      },
      addressDistrict: {
        type: String,
      },
      addressProvince: {
        type: String,
      },
      addressCountry: {
        type: String,
      },
      addressPostalCode: {
        type: String,
      },
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
    },
  },
  ipIPRelationship: {
    type: [
      {
        involedPartyID: {
          type: String,
        },
        ipRelationshipType: {
          type: String,
        },
      },
    ],
  },
  businessTermAndCondition: {
    type: {
      paymentTerm: {
        type: String,
      },
      creditLimit: {
        type: Number,
      },
      creditOnHold: {
        type: Number,
      },
      onHoldDescription: {
        type: String,
      },
      grade: {
        type: String,
      },
    },
  },
  membership: {
    type: [
      {
        activity: {
          type: String,
          enum: ["member", "delivery", "driver", "shareholder", "supplier"],
          default: "delivery",
        },
        memberReference: {
          type: String,
        },
      },
    ],
  },
  recordInfo: {
    type: {
      createBy: {
        type: String,
      },
      createDate: {
        type: Date,
      },
      updateBy: {
        type: String,
      },
      updateDate: {
        type: Date,
      },
    },
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
  },
  createby: {
    _id: {
      type: String,
    },
    username: {
      type: String,
    },
    displayname: {
      type: String,
    },
  },
  updateby: {
    _id: {
      type: String,
    },
    username: {
      type: String,
    },
    displayname: {
      type: String,
    },
  },
});
InvolvedpartySchema.pre("save", function (next) {
  let Involvedparty = this;
  const model = mongoose.model("Involvedparty", InvolvedpartySchema);
  if (Involvedparty.isNew) {
    // create
    if (Involvedparty.membership.length === 0) {
      var membership = {
        activity: "delivery",
        memberReference: "",
      };
      Involvedparty.membership = [membership];
    }
    next();
  } else {
    // update
    if (Involvedparty.membership.length === 0) {
      var membership = {
        activity: "delivery",
        memberReference: "",
      };
      Involvedparty.membership = [membership];
    }
    Involvedparty.updated = new Date();
    next();
  }
});
mongoose.model("Involvedparty", InvolvedpartySchema);

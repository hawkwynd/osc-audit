const mongoose = require('mongoose');
  let Schema = mongoose.Schema;

  let AuditSchema = new Schema({
    url: {
        type: String
    },
    isCompliant: {
      type: Boolean,
      default: false
    },
    comment: {
      type: String
    },
    diffData: {
        type: String
    },
    oldData: {
        type: String
    },
    newData: {
        type: String
    },
    oldAssets: [{
        type: String
    }],
    newAssets: [{
        type: String
    }],
    cu: {
        type: mongoose.Types.ObjectId,
        ref: 'Customer'
    },
    cuName: {
        type: String
    },
    rootUrl: {
        type: String
    },
    modified: {
      type: String
    },
    compareDate: {
      type: String
    }
  },
  { timestamps: true}
);

  //Create Collection and add Schema
  mongoose.model('Audit', AuditSchema);
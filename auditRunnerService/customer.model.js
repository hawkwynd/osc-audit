const mongoose = require('mongoose');
      mongoose.set('useCreateIndex', true); // Deprecation Warning suppressor
      
  let Schema = mongoose.Schema;

  let CustomerSchema = new Schema({
    name: {
        type: String
    },
    url: {
        type: String
    },
    code: {
        type: String,
        index: true
    },
    email: {
      type: String,
      required: true
    },
    sitemap: [
        {
            loc: String,
            lastChange: String,
            content: Schema.Types.Mixed,
            assets: [String]
        }
    ]
  },
  { timestamps: true}
);


CustomerSchema.statics.getCustomerByCode = function(code, callback) {
  this.model('Customer').find({code: code}).then(callback(res))
};

  //Create Collection and add Schema
mongoose.model('Customer', CustomerSchema);

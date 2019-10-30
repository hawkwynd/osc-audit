const mongoose = require('mongoose');
      mongoose.set('useFindAndModify', false);
      mongoose.set('useUnifiedTopology', true);
      mongoose.set('useCreateIndex', true);
      
const shortid = require('shortid');
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
        index: true,
        default: shortid.generate,
        unique: true
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
// Accept code(password) and email address for login and lookup pair match
CustomerSchema.statics.getCustomerByCode = function(code, email, callback) {
  this.model('Customer').findOne({code: code, email: email}).then(callback)
};

  //Create Collection and add Schema
  mongoose.model('Customer', CustomerSchema);

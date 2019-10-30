const mongoose =  require('mongoose');
const Schema  =  mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema(
	{
		name: {
			type: String,
			type: String,
		},
		email: {
			type: String,
			index: true,
			trim: true,
			unique: true,
			required: true
		},
		password: {
			type: String,
			required: true,
			bcrypt: true
		},
		last_login_date: {
			type: Date,
			default: Date.now
		}
	},{ timestamps: true});

UserSchema.statics.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

UserSchema.statics.getUserByEmail = function(email, callback){
  var query = {email: email};
  this.model('User').findOne(query, callback);
};

UserSchema.statics.getUserById = function(id, callback){
  this.model('User').findById(id, callback);
};

UserSchema.statics.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
};

mongoose.model('User', UserSchema);

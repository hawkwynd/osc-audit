// Activity Monitor
const mongoose = require('mongoose');
      mongoose.set('useFindAndModify', false);
      mongoose.set('useUnifiedTopology', true);
      mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

//schema
const MessagesSchema = new Schema({
    action: { type: String, required: true },
    userID: {type: String, required: true},
    messageText: { type: String, required: false }
  },{timestamps:true});
  
  mongoose.model("Messages", MessagesSchema);


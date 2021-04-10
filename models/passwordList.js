const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const passwordSchema = new Schema({
    website:{
        type: String,
        required : true
    },
    username:{
        type: String,
        required : true
    },
    password:{
        type:String,
        required:true
    }

}, {timestamps: true});




const PasswordList = mongoose.model('passwordList', passwordSchema);

module.exports = PasswordList;


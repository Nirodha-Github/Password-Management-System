const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

var validateEmail = function(email) {

    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    return re.test(email)

};

const userSchema = new Schema({
    name:{
        type: String,
        required : true
    },
  password:{
        type: String,
        required : true
    },
  repassword:{
        type: String,
        required : true
    },
    email:{
        type:String,
        required:true,
        validate: [validateEmail, 'Please fill a valid email address'],
         match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phonenumber:{
        type:Number,
        required:true
    }

}, {timestamps: true});

userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};

const UserList = mongoose.model('UserList', userSchema);


module.exports = UserList;



const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
        unique:true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phonenumber:{
        type:Number,
        required:true
    },
   passwordChangedAt:Date,
   passwordResetToken:String,
   passwordResetExpires:Date
}, 
 {timestamps: true});

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

userSchema.pre("save", function(next) {
    if(!this.isModified("repassword")) {
        return next();
    }
    this.repassword = bcrypt.hashSync(this.repassword, 10);
    next();
});

userSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.repassword));
};

userSchema.methods.createPasswordResetToken = function(){
   const resetToken = crypto.randomBytes(32).toString('hex');
   console.log({resetToken},this.passwordResetToken)
   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
   this.passwordResetExpires = Date.now() + 20 * 60 * 1000;
   return resetToken;
}

const UserList = mongoose.model('UserList', userSchema);


module.exports = UserList;



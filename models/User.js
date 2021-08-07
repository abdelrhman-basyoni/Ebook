const mongoose = require('mongoose')
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const uniqueValidator = require('mongoose-unique-validator');


const UserSchema = new mongoose.Schema({

    username:{
        type: String,
        required:[true, "please enter username"],
        unique:true
        

    },
    password:{
        type: String,
        required:true,
        
    },
 
    firstName:{
        type: String,
        
    },
    lastName:{
        type: String,
        
    },
    email:{
        type: String,
        required:[true, "please provid email"],
        unique:true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "please Enter a valid email"
        ]
    },
    isPublisher:{
        type:Boolean,
        default:false

    },
    isAdmin:{
        type:Boolean,
        default:false

    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    passwordResetToken:{type:String},
    restPasswordExpire:{type:Date}
})
UserSchema.pre('save', async function(next)  {
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);

})


UserSchema.methods.checkpassword = async function (password){
    return await  bcrypt.compare(password, this.password);
};

UserSchema.methods.getPasswordResetToken = async function(){
    const resetToken =  crypto.randomBytes(20).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    //milli second so min * (second * millil)
    this.restPasswordExpire = Date.now() + 10 * (60*1000)

    this.res
    return resetToken

};

UserSchema.methods.checkResetTokenExpire = async function (){
    if(this.restPasswordExpire > Date.now() ) return true;
    else{
        this.passwordResetToken = undefined;
        this.restPasswordExpire = undefined;
        return false;
    }


    
}

UserSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
module.exports = mongoose.model('User',UserSchema)
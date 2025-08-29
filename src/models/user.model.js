
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jsonwebtoken from "jsonwebtoken";

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowerCase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowerCase:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:[true,"password is required"],
        trim:true,
        lowerCase:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudnery url
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    refreshToken:{
        type:String
    }
    
},{timestamps:true})

userSchema.pre("save",async function(next){
    if (!this.isModified("password")) {
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPassordCorrect=async function(password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    jsonwebtoken.sign({
        _id:this._id,
        userName:this.username,
        email:this.email,
        fullName:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN
    }
)
}

userSchema.methods.generateRefreshToken=function(){
    jsonwebtoken.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

export const User=mongoose.model("User",userSchema)



/*
code that generate secret key

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
*/

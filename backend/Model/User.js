
const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const User = mongoose.model('User', 
{ 
    name: String,
    emailId:String,
    imgUrl:String,
    googleId:String,
    points:Number,
    nickName:String
 });

 module.exports=User
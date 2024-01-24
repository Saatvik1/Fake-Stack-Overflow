var mongoose = require('mongoose')

var usersSchema = mongoose.Schema

var usersModelSchema = new usersSchema({
username : {type : String, required : true, minLength: 1, maxLength: 100},
password : {type : String, required : true, minLength : 1},
accName : {type : String, required : true, minLength : 1},
reputation : {type : Number, required : true, default : 0},
questions : [{type : usersSchema.Types.ObjectId, ref: "Questions"}],
accCreation : {type : Date, required : true, default : Date()},
admin : {type : Boolean, required : true, default : false},
tags : [{type : usersSchema.Types.ObjectId, ref: "Tags"}],
answers : [{type : usersSchema.Types.ObjectId, ref : "Answers"}]
})



module.exports = mongoose.model('Users', usersModelSchema)
var mongoose = require('mongoose')

var commentsSchema = mongoose.Schema

var commentsModelSchema = new commentsSchema({
username : {type : String, required : true, minLength: 1, maxLength: 100},
votes : {type : Number, required : true, default : 0},
text : {type : String, required : true, minLength : 1},
comment_date : {type : Date, required : true, default : Date()}
})



module.exports = mongoose.model('Comments', commentsModelSchema)
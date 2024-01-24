// Answer Document Schema
//Bwam.
var mongoose = require('mongoose')

var answerSchema = mongoose.Schema

var answerModelSchema = new answerSchema({
    text : {type : String, required: true, minLength:1},
    ans_by : {type : String, required: true, minLength:1},
    ans_date_time : {type : Date, required: true, default: Date()},
    votes : {type: Number, required: true, default: 0},
    comments : [{type : answerSchema.Types.ObjectId, ref: 'Comments'}],
    userID : {type : answerSchema.Types.ObjectId, ref: 'Users'},
})

answerModelSchema.virtual('url')
    .get(function() {
        return `posts/answer/${this._id}`;
    });

module.exports = mongoose.model('Answers', answerModelSchema)




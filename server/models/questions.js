// Question Document Schema

var mongoose = require('mongoose')

var questionSchema = mongoose.Schema

var questionModelSchema = new questionSchema({
    title: { type: String, required: true, minLength: 1, maxLength: 100 },
    text: { type: String, required: true, minLength: 1 },
    answers: [{ type: questionSchema.Types.ObjectId, ref: 'Answers' }],
    tags: [{ type: questionSchema.Types.ObjectId, ref: 'Tags' }],
    asked_by: { type: String, required: true, minLength: 1, default: 'Anonymous' },
    ask_date_time: { type: Date, required: true, default: Date() },
    views: { type: Number, default: 0 },
    summary: { type: String, maxLength: 140 },
    votes: { type: Number, required: true, default: 0 },
    comments: [{ type: questionSchema.Types.ObjectId, ref: "Comments" }],
    userID: {type: questionSchema.Types.ObjectId, ref: "Users"}
})

questionModelSchema.virtual('url')
    .get(function() {
        return `posts/question/${this._id}`;
    });

module.exports = mongoose.model('Questions', questionModelSchema)


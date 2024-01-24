// Tag Document Schema

var mongoose = require('mongoose')

var tagSchema = mongoose.Schema

var TagModelSchema = new tagSchema({
    name : {type : String, required: true, minLength:1, maxLength: 20},
})

TagModelSchema.virtual('url')
    .get(function() {
        return `posts/tag/${this._id}`;
    });

module.exports = mongoose.model('Tags', TagModelSchema)
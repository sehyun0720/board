const mongoose = require('mongoose');

// schema
let commentSchema = mongoose.Schema({
    post:{type:mongoose.Schema.Types.ObjectId, ref:'post', required:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    parentComment:{type:mongoose.Schema.Types.ObjectId, ref: 'comment'},
    text:{type:String, required:[true, 'text is required!']},
    isDeleted:{type:Boolean},       //진짜 지우면 하위 댓글들이 부모를 잃기때문에 진짜 지우진 않음
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
}, {
    toObject: {virtuals:true}
});

commentSchema.virtual('childComments')  
    .get(function(){ return this._childComments; })
    .set(function(value){ this._childComments=value; });

// model & export
let Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;
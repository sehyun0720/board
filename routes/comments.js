let express = require('express');
let router = express.Router();
let Comment = require('../models/Comment');
let Post = require('../models/Post');
let util = require('../util');

// create
router.post('/', util.isLoggedin, checkPostId, function(req, res){
    let post = res.locals.post;

    req.body.author = req.user._id;
    req.body.post = post._id;

    Comment.create(req.body, function(err, comment){
        if(err){
            req.flash('commentForm', { _id: null, form:req.body });
            req.flash('commentError', { _id: null, errors:util.parseError(err) });
        }
        return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
    });
});

module.exports = router;

// private functions
function checkPostId(req, res, next){
    Post.findOne({_id:req.query.postId}, function(err, post){
        if(err) return res.json(err);

        res.locals.post = post;
        next();
    });
}
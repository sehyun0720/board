const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const util = require('../util');

// Index
/**router.get('/', function(req, res){
    Post.find({})
    .sort('-createdAt')             // 정렬
    .exes(function(err, posts){     // exes : 앞에 함수들 실행하고 exec 실행  - 원래는 find({}, function(err, posts){ ... }) 으로 줄여서 쓸 수 있음
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    });                                
});

router.get('/', function(req, res){
    Post.find({}, function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    }).sort('-createdAt');
});*/
router.get('/', async function(req, res){
    let page = Math.max(1, parseInt(req.query.page));
    let limit = Math.max(1, parseInt(req.query.limit));
    page = !isNaN(page)?page:1;
    limit = !isNaN(limit)?limit:10;

    let skip = (page-1)*limit;
    let count = await Post.countDocuments({});
    let maxPage = Math.ceil(count/limit);
    let posts = await Post.find({})
        .populate('author')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .exec();

    res.render('posts/index', {
        posts:posts,
        currentPage:page,
        maxPage:maxPage,
        limit:limit
    });
});

// New
router.get('/new', util.isLoggedin, function(req, res){
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', {post:post, errors:errors});
});

// create
router.post('/', util.isLoggedin, function(req, res){
    req.body.author = req.user._id;
    Post.create(req.body, function(err, post){
        if(err){ 
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new'+res.locals.getPostQueryString());
        }
        res.redirect('/posts');
    });
});

// show
router.get('/:id', function(req, res){
    Post.findOne({_id:req.params.id})
    .populate('author')
    .exec(function(err, post){
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});

// edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
    let post = req.flash('post')[0];
    let errors = req.flash('errors')[0] || {};
    if(!post){
        Post.findOne({_id:req.params.id}, function(err, post){
            if(err) return res.json(err);
            res.render('posts/edit', {post:post, errors:errors});
        });
    }
    else{
        post._id = req.params.id;
        res.render('posts/edit', {post:post, errors:errors});
    }
});

// update
router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
    req.body.updateAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
        if(err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/'+req.params.id+'/edit'+res.locals.getPostQueryString());
        }
        res.redirect('/posts/'+req.params.id+res.locals.getPostQueryString());
    });
});

// destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
    Post.deleteOne({_id:req.params.id}, function(err){
        if(err) return res.json(err);
        res.redirect('/posts'+res.locals.getPostQueryString());
    });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
    Post.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        if(post.author != req.user.id) return util.noPermission(req, res);

        next();
    });
}
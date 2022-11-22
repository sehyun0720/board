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
});*/

router.get('/', function(req, res){
    Post.find({}, function(err, posts){
        if(err) return res.json(err);
        res.render('posts/index', {posts:posts});
    }).sort('-createdAt');
});

// New
router.get('/new', function(req, res){
    let post = req.flash('post')[0] || {};
    let errors = req.flash('errors')[0] || {};
    res.render('posts/new', {post:post, errors:errors});
});

// create
router.post('/', function(req, res){
    Post.create(req.body, function(err, post){
        if(err){ 
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new');
        }
        res.redirect('/posts');
    });
});

// show
router.get('/:id', function(req, res){
    Post.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('posts/show', {post:post});
    });
});

// edit
router.get('/:id/edit', function(req, res){
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
router.put('/:id', function(req, res){
    req.body.updateAt = Date.now();
    Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
        if(err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/'+req.params.id+'/edit');
        }
        res.redirect('/posts/'+req.params.id);
    });
});

// destroy
router.delete('/:id', function(req, res){
    Post.deleteOne({_id:req.params.id}, function(err){
        if(err) return res.json(err);
        res.redirect('/posts');
    });
});

module.exports = router;
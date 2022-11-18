const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Index
router.get('/', function(req, res){
    User.find({}, function(err, users){
        if(err) return res.json(err);
        res.render('users/index', {users:users});
    }).sort({username:1});
});

// New
router.get('/new', function(req, res){
    var user = req.flash('user')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('users/new', { user:user, errors:errors});
});

// create
router.post('/', function(req, res){
    User.create(req.body, function(err, user){
        if(err){ 
            req.flash('user', req.body);
            req.flash('errors', parseError(err));
            return res.redirect('/users/new');
        }
        res.redirect('/users');
    });
});

// show
router.get('/:username', function(req, res){
    User.findOne({username:req.params.username}, function(err, user){
        if(err) return res.json(err);
        res.render('users/show', {user:user});
    });
});

// edit
router.get('/:username/edit', function(req, res){
    var user = req.flash('user')[0];
    var errors = req.flash('errors')[0] || {};
    if(!user){
        User.findOne({username:req.params.username}, function(err, user){
            if(err) return res.json(err);
            res.render('users/edit', {user:user});
        });    
    }
    else { res.render('users/edit', { username:req.params.username, user:user, errors:errors });}
});

// update
router.put('/:username', function(req, res, next){
    User.findOne({username:req.params.username})
    .select('password')
    .exec(function(err, user){
        if(err) return res.json(err);

        // update user object
        user.originalPassword = user.password;
        user.password = req.body.newPassword? req.body.newPassword : user.password;
        for(let p in req.body){
            user[p] = req.body[p];
        }

        // save updated user
        user.save(function(err, user){
            if(err){
                req.flash('user', req.body);
                req.flash('errors', parseError(err));
                return res.redirect('/users/'+req.params.username+'/edit');
            }
            res.redirect('/users/'+user.username);
        });
    });
});

// destroy
router.delete('/:username', function(req, res){
    User.deleteOne({username:req.params.username}, function(err){
        if(err) return res.json(err);
        res.redirect('/users');
    });
});

module.exports = router;

// functions
function parseError(errors){
    var parsed = {};
    if(errors.name == 'ValidationError'){
        for(var name in errors.errors){
            var ValidationError = errors.errors[name];
            parsed[name] = {message:ValidationError.message};
        }
    }
    else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0){
        parsed.username = {message:'This username already exists!'};
    }
    return parsed;
}
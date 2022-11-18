const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// schema
var userSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true, 'Username is required!'],
        match:[/^.{4,12}$/, 'Should be 4-12 characters!'],
        trim: true,
        unique:true
    },
    password:{
        type:String,
        required:[true, 'Password is required!'],
        select:false
    },
    name:{
        type:String,
        required:[true, 'Name is required!'],
        match:[/^.{4,12}$/, 'Should be 4-12 characters!'],
        trim: true
    },
    email:{
        type:String,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/, 'Should be vaild email address!'],
        trim:true
    }
         
}, {
    toObject:{virtuals:true}
});


// virtuals     >> 필요한 값이지만, DB에 저장할 필요는 없는 값들...
userSchema.virtual('passwordConfirmation')
    .get(function(){return this._passwordConfirmation; })
    .set(function(value){this._passwordConfirmation=value;});

userSchema.virtual('originalPassword')
    .get(function(){return this._originalPassword; }) 
    .set(function(value){this._originalPassword=value; });

userSchema.virtual('currentPassword')
    .get(function(){return this._currentPassword;})
    .set(function(value){this._currentPassword=value;});

userSchema.virtual('newPassword')
    .get(function(){return this._newPassword;})
    .set(function(value){this._newPassword=value;});

// password validation >> 
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
let passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';

userSchema.path('password').validate(function(v){
    var user = this;

    // create user
    if(user.isNew){
        if(!user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
        }

        if(!passwordRegex.test(user.password)){
            user.invalidate('password', passwordRegexErrorMessage);
        }
        if(user.password !== user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }

    // update user
    if(!user.isNew){
        if(!user.currentPassword){
            user.invalidate('currentPassword', 'Current Password is required!');
        }
        else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){  //저장된 hash와 입력받은 password의 hash가 일치하는 지확인..(해독해서 비교하는게 아니라 text값을 hash로 만들고 비교함)
            user.invalidate('currentPassword', 'Current Password is invalid!');
        }

        if(user.newPassword && !passwordRegex.test(user.newPassword)){
            user.invalidate("newPassword", passwordRegexErrorMessage);
        }
        else if(user.newPassword !== user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }
});

// hash password
userSchema.pre('save', function(next){      //schema.pre > 첫번째 파라미터로 설정된(=save) 함수가 실행되기 전에 callback함수 먼저 실행시킴
    let user = this;

    if(!user.isModified('password')){       //isModified : 해당 값이 db에 기록된 값에서 변경된 경우 true, 않은경우 false 반환.. > user 생성시에는 항상 true, 수정시에는 password 변경되는 경우에만 true 반환
       return next();
    }
    else {
        user.password = bcrypt.hashSync(user.password); // user를 생성하거나 수정할 시 변경이 있는 경우.. bcrypt.hashSync로 password -> hash로 바꿈
        return next();
    }
});

// model & export
userSchema.methods.authenticate = function(password){
    let user = this;
    return bcrypt.compareSync(password,user.password);      // 입력받은 password hash와 저장된 password hash 비교..(로그인 시 사용)
}

var User = mongoose.model('user', userSchema);
module.exports = User;
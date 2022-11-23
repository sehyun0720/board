const express = require('express');
const mongoose = require('mongoose');
const mongodbUrl = "mongodb+srv://sehyun:0720@cluster0.ken63ir.mongodb.net/?retryWrites=true&w=majority";
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('./config/passport');
const util = require('./util');
const app = express();

//DB setting
mongoose.connect(mongodbUrl);
var db = mongoose.connection;
db.once('open', function(){
    console.log('DB conecction');
});
db.on('error', function(err){
    console.log('DB ERROR : ' + err);
});

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize()); //passport 초기화
app.use(passport.session());    // passport를 session과 연결

//Custom Middleware
app.use(function(req, res, next){
    //res.locals 변수 > ejs에서 바로 사용 가능
    res.locals.isAuthenticated = req.isAuthenticated(); //현재 로그인되어 있는지 확인
    res.locals.currentUser = req.user;     // session으로부터 user를 deserialize하여 생성된다.
    next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));

// Port setting
var port = 3000;
app.listen(port, function(){
    console.log('server on! http://localhost:'+port);
});
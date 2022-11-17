const express = require('express');
const mongoose = require('mongoose');
const mongodbUrl = "mongodb+srv://sehyun:0720@cluster0.ken63ir.mongodb.net/?retryWrites=true&w=majority";
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
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

// Routes
app.use('/', require('./routes/home'));

// Port setting
var port = 3000;
app.listen(port, function(){
    console.log('server on! http://localhost:'+port);
});
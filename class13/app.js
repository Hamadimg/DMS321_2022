const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
var urlencodedParser=bodyParser.urlencoded({extended:false});
var app = express();

const sess_uri = process.env.ATLAS_SESSION_URI;

app.use(session({ secret: 'fnord',
                  store: MongoStore.create({ mongoUrl: sess_uri }),
                  resave: false,
                  saveUninitialized: false,
                  cookie: { maxAge: 24*60*60*1000 }}))


app.use(function (req,res,next) {
    res.set('Cache-Control','no-store');
    next();
    });

app.use(bodyParser.urlencoded({extended:false}));



const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

function homepage(req, res) {
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage('<p>Hello World, from express</p>'));
    }
app.get('/', homepage);


/*
const rps = require('./rps.js');
app.get('/rps/:choice', rps.RPSChoice);

const miniblog = require('./miniblog.js');
app.get('/blog', miniblog.Blog);
app.post('/blogpost', urlencodedParser, miniblog.BlogPost);

const mymongo = require('./mymongo.js');
app.use('/', mymongo);

const todo = require('./todo.js');
app.use('/',todo);
*/

const cookies = require('./cookies.js');
app.use('/',cookies);


var server = app.listen(8079, function () {});

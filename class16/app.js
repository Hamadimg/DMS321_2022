const express = require('express');
let app = express();

const session = require('express-session');
const MongoStore = require('connect-mongo');
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

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));



const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

function homepage(req, res) {
    res.send(makeHTMLPage('<p>Hello World, from express</p>'));
    }
app.get('/', homepage);


/*
const rps = require('./rps.js');
app.get('/rps/:choice', rps.RPSChoice);

const miniblog = require('./miniblog.js');
app.get('/blog', miniblog.Blog);
app.post('/blogpost', miniblog.BlogPost);

app.use('/', require('./todo.js'));

app.use('/', require('./mymongo.js'));

app.use('/', require('./cookies.js'));
*/

app.use('/', require('./social3.js'));


let server = app.listen(8079, function () {});

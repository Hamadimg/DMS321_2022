var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended:false});

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

const rps = require('./rps.js');
const miniblog = require('./miniblog.js');
const mymongo = require('./mymongo.js');



function homepage(req, res) {
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage('<p>Hello World, from express2</p>'));
    }

function Submitform(req, res) {
    var answer = makeHTMLPage(`<p>Hello, ${req.body.username}</p><p>Your message was:</p><pre>${req.body.message}</pre>`);
    res.send(answer);
    }


app.get('/', homepage);
app.get('/blog', miniblog.Blog);
app.post('/blogpost', urlencodedParser, miniblog.BlogPost);
app.post('/submitform', urlencodedParser, Submitform);
app.get('/rps/:choice', rps.RPSChoice);
app.get('/mongo/:title', mymongo.search);

const restarter = require('./restarter.js');
app.get('/restart', restarter.restart);

var server = app.listen(8081, function () {});

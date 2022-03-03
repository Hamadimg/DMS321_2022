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
    res.send(makeHTMLPage('<p>Hello World, from express</p>'));
    }


app.get('/', homepage);
app.get('/blog', miniblog.Blog);
app.post('/blogpost', urlencodedParser, miniblog.BlogPost);
app.get('/rps/:choice', rps.RPSChoice);
app.get('/mongo/:title', mymongo.search);

var server = app.listen(8081, function () {});

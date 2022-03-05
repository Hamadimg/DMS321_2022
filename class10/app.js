var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended:false});

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

function homepage(req, res) {
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage('<p>Hello World, from express</p>'));
    }
app.get('/', homepage);


/* Rock-Paper-Scissors */
/*
const rps = require('./rps.js');
app.get('/rps/:choice', rps.RPSChoice);
*/
/* Mini-blog */
/*
const miniblog = require('./miniblog.js');
app.get('/blog', miniblog.Blog);
app.post('/blogpost', urlencodedParser, miniblog.BlogPost);
*/


/* MongoDB example (film title search) */
const mymongo = require('./mymongo.js');
app.get('/mongo/:title', mymongo.search);



var server = app.listen(8081, function () {});

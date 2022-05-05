/*
 Example of how to include a websocket server into app.js when working with Phusion Passenger.
 This should be renamed app.js if you're going to use it.
 Note that you will need to visit one of the express routes (such as '/') first, to cause Passenger to start this app, *before* attempting to connect to the socket server.  If your page that uses sockets is returned via an express route, rather than being a static html file, that should be sufficient.
*/
const express = require('express');
let app = express();

app.set('view engine', 'ejs');

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



/* note: I removed the 'makeHtml' bit, just to simplify installing this.  technically, the returned page is now incomplete, but it's enough for testing */
function homepage(req, res) {
    res.send('<p>Hello World, from express</p>');
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

app.use('/', require('./mymongo3.js'));
app.use('/', require('./social8.js'));
app.use('/data', require('./data.js'));
app.use('/rpsr', require('./rpsroyale.js'));
app.use('/server', require('./ajaxserver.js'));


/* This tells Passenger to use this instance of express as the "main" server (at port 80) */
if (typeof(PhusionPassenger) != 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    let server = app.listen('passenger', function () {});
    }
else {
    let server = app.listen(8079, function () {});
    }



/* Create the WebSocket server, which will use port 7080 in this example */
/* Be aware that if you have this app running via Passenger, and then also
  try to run it manually at the same time (for debugging), it may die
  because of two separate processes trying to both use the same port.  */
const { WebSocket, WebSocketServer } = require('ws');

const httpserver = require('http').createServer();
const wss = new WebSocketServer({server: httpserver}, function () {});
httpserver.listen(7080);

wss.on('connection', newConnection);

function newConnection(ws) {
    console.log('new connection');
    ws.on('message', function (data) { receiveData(data,ws); });
    }

function receiveData(data,ws) {
    wss.clients.forEach(function (client) {
        if ((client != ws) && (client.readyState === WebSocket.OPEN)) {
            client.send(data, { binary: false });
            }
        });
    }

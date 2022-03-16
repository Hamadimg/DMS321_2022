/* Simple demo of using express sessions, with a mongodb session store. */
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
let app = express();

/* Get this string from mongodb.com's "Connect" command.
   Make sure to put your actual password in it, and replace "myFirstDatabase" by your database name */
const sess_uri = "mongodb+srv://dave:badpassword@cluster0.1iikc.mongodb.net/sessions?retryWrites=true&w=majority";

app.use(session({ secret: 'fnord',
                  store: MongoStore.create({ mongoUrl: sess_uri }),
                  resave: false,
                  saveUninitialized: false,
                  cookie: { maxAge: 60*60*1000 }}))


function homepage(req, res) {
    let sess = req.session;
    if (!sess.luckyNumber)
        sess.luckyNumber = Math.random();
    if (!sess.views)
        sess.views = 0;
    sess.views = sess.views + 1;
    res.send(`<p>Hello. Your lucky number is ${sess.luckyNumber}. You have visited ${sess.views} times.</p>`);
    }
app.get('/', homepage);


/* Replace 8079 by your port number (pick a random number between 2000 & 10000 */
let server = app.listen(8079, function () {});

/* Beginning of social media site.
   Step 2: Use hashed passwords
    Note: you must run "npm install bcrypt" to be able to run this
*/
const path = require('path');
const makeHTMLPage = require('./makehtml.js').makeHTMLPage;
const bcrypt = require('bcrypt');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

var _db;
async function getDb() {
    if (!_db)
        {
        await client.connect();
        _db = await client.db("social");
        }
    return _db;
    }


function socialFeed(req, res) {
    let output = `<p>Welcome, ${req.session.user.screenname}.</p><p>Your profile says "${req.session.user.profile}"</p>`;
    output += `<a href="${req.baseUrl}/logout">log out</a>`;
    res.send(makeHTMLPage(output));
    }


function socialLoginPage(req, res) {
    res.sendFile('static/loginpage.html', { root: path.join(__dirname) });
    }


function socialHome(req, res) {
    if (req.session.user)
        socialFeed(req, res);
    else
        socialLoginPage(req, res);
    }


async function socialLogin(req, res) {
    let db = await getDb();
    let collection = db.collection("users");
    let query = { email: new RegExp(`^${req.body.username}$`,'i') };
    collection.findOne(query, async function (err,result) {
        if (err) { response.send(err); }
        if (result)
            {
            let ok = await bcrypt.compare(req.body.password, result.password);
            if (ok) {
                req.session.user = result;
                res.redirect(`${req.baseUrl}`);
                }
            else {
                res.redirect(`${req.baseUrl}/loginerror`);
                }
            }
        else {
            res.redirect(`${req.baseUrl}/loginerror`);
            }
        });
    }


async function socialNewAccount(req, res) {
    let db = await getDb();
    let collection = db.collection("users");
    let query = { email: new RegExp(`^${req.body.username}$`,'i') };
    let numExisting = await collection.count(query);
    if (numExisting == 0) {
        let passwordhash = await bcrypt.hash(req.body.password, 10);
        let obj = { email: req.body.username, screenname: req.body.screenname, password: passwordhash, profile: req.body.profile };
        collection.insertOne(obj, function (err,result) {
            if (err) { throw err; }
            socialLogin(req,res);
            });
        }
    else {
        res.redirect(`${req.baseUrl}/newaccounterror`);
        }
    }


function socialLoginError(req, res) {
    res.sendFile('static/loginerror.html', { root: path.join(__dirname) });
    }


function socialNewAccountError(req, res) {
    res.sendFile('static/newaccounterror.html', { root: path.join(__dirname) });
    }


function socialLogout(req, res) {
    req.session.destroy(function (err) {
        if (err) { throw err; }
        res.redirect(`${req.baseUrl}`);
        });
    }

const express = require('express');
let router = express.Router();

router.get('/', socialHome);
router.get('/feed', socialFeed);
router.post('/login', socialLogin);
router.get('/logout', socialLogout);
router.get('/loginerror', socialLoginError);
router.post('/newaccount', socialNewAccount);
router.get('/newaccounterror', socialNewAccountError);

module.exports = router;

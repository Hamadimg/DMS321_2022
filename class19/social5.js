/* Continuing social media site.
   Step 2: Use hashed passwords
   Step 3: Create-new-login page, which also sends an email to the user
   Step 4: Use EJS templating
   Step 5: Add templates for all the major pages; add posting & "myprofile" page; add input validation & sanitization
    Note: you must run "npm install express-validator" for this to work
*/
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
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




function socialHome(req, res) {
    if (req.session.user)
        socialFeed(req, res);
    else
        socialLoginPage(req, res);
    }



function socialLoginPage(req, res) {
    res.render('loginpage');
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
                res.redirect(`/social`);
                }
            else {
                res.redirect(`/social/loginerror`);
                }
            }
        else {
            res.redirect(`/social/loginerror`);
            }
        });
    }


function emailConfirmation(user, req) {
    let transporter = nodemailer.createTransport({
        host: process.env.SOCIAL_EMAIL_SERVER,
        port: 587,
        secure: false,
        requireTLS: true,
        tls: { rejectUnauthorized: false },
        auth: {
            user: process.env.SOCIAL_EMAIL_ADDRESS,
            pass: process.env.SOCIAL_EMAIL_PASSWORD,
            }
        });
    let mailOptions = {
        from: `Social Media <${process.env.SOCIAL_EMAIL_ADDRESS}>`,
        to: user.email,
        subject: `email from nodejs socialmedia`,
        text: `Hello, you have created an account on the social media server (${req.headers.host}) for the address "${user.email}"`
        };
    transporter.sendMail(mailOptions, function (err,info) { if (err) console.log(err); else console.log(`mail sent to ${user.email}`); });
    }


async function socialNewAccount(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.render('error', { errors: errors.array() }); }
    let db = await getDb();
    let collection = db.collection("users");
    let query = { email: new RegExp(`^${req.body.username}$`,'i') };
    let numExisting = await collection.count(query);
    if (numExisting == 0) {
        let passwordhash = await bcrypt.hash(req.body.password, 10);
        let obj = { email: req.body.username, screenname: req.body.screenname, password: passwordhash, profile: req.body.profile };
        collection.insertOne(obj, function (err,result) {
            if (err) { console.log(err); return res.sendStatus(500); }
            emailConfirmation(obj, req);
            socialLogin(req,res);
            });
        }
    else {
        res.redirect(`/social/newaccounterror`);
        }
    }


function socialLoginError(req, res) {
    res.render('loginerror');
    }


function socialNewAccountError(req, res) {
    res.render('newaccounterror');
    }


function socialLogout(req, res) {
    req.session.destroy(function (err) {
        if (err) { console.log(err); return res.sendStatus(500); }
        res.redirect(`/social`);
        });
    }



async function socialFeed(req, res) {
/* Display the home page "index.ejs", with data for this user */
    res.render('index', {user: req.session.user, posts: []});
    }



async function socialMyProfile(req, res) {
    if (!req.session.user) { res.redirect(`/social`); }
    else {
        let db = await getDb();
        let collection = db.collection("posts");
        let query = { posterid: req.session.user._id };
        collection.find(query).sort({date:-1}).toArray(async function (err,result) {
            if (err) { console.log(err); return res.sendStatus(500); }
            let posts = [];
            for (let i=0; i < result.length; i++) {
                let r = result[i];
                let d = new Date(r.date);
                let p = { date: d.toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"}),
                          text: r.posttext };
                posts.push(p);
                }
            let renderdata = { profile: req.session.user.profile, posts: posts };
            res.render('myprofile', renderdata);
            });
        }
    }


async function socialProfile(req, res) {
    res.render('profile');
    }


async function socialEditProfile(req, res) {
    res.render('editprofile');
    }


async function socialSearch(req, res) {
    res.render('searchresults');
    }


async function socialNewPost(req, res) {
    if (!req.session.user) { res.redirect(`/social`); }
    else {
        let db = await getDb();
        let user = req.session.user;
        let obj = { postername: user.screenname, 
                    posterid: user._id, 
                    date: Date.now(), 
                    posttext: req.body.posttext };
        db.collection("posts").insertOne(obj, function (err,result) {
            if (err) { console.log(err); return res.sendStatus(500); }
            res.redirect(`/social`);
            });
        }
    }


const express = require('express');
let router = express.Router();

router.get('/social', socialHome);
router.get('/social/feed', socialFeed);
router.post('/social/login', socialLogin);
router.get('/social/logout', socialLogout);
router.get('/social/loginerror', socialLoginError);
router.post('/social/newaccount', body('username').isEmail(), body('password').isLength({min:5}), socialNewAccount);
router.get('/social/newaccounterror', socialNewAccountError);
router.get('/social/myprofile', socialMyProfile);
router.get('/social/profile/:id', socialProfile);
router.get('/social/editprofile', socialEditProfile);
router.post('/social/search', socialSearch);
router.post('/social/newpost', body('posttext').escape(), socialNewPost);

module.exports = router;

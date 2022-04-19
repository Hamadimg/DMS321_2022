/* Continuing social media site.
   Step 2: Use hashed passwords
   Step 3: Create-new-login page, which also sends an email to the user
   Step 4: Use EJS templating
   Step 5: Add templates for all the major pages; add posting & "myprofile" page; add input validation & sanitization
   Step 6: Add code to edit one's own profile, and to search for other users and display their profiles
   Step 7: Add "follow" commands
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
    if (!req.session.user) { res.redirect(`/social`); }
    let db = await getDb();
    let posts = [];
    let collection = db.collection("follows");
    collection.find({by: req.session.user._id}).toArray(async function (err,result) {   /* get a list of everyone I follow */
        let promises = [];
        for (let i=0; i < result.length; i++) {               /* for each person I follow, get their latest post(s) */
            let other = result[i].follow;
            promises.push(getPosts(other));
            }
        Promise.all(promises).then(function (postlists) {     /* all requests are asynchronous; wait for them to finish */
            let posts = [];
            for (let i=0; i < postlists.length; i++)          /* combine the results into one list for rendering */
                posts = posts.concat(postlists[i]);
            res.render('index', {user: req.session.user, posts: posts});
            });
        });
    }


async function getPosts(userid) {           /* get the most recent post(s) by a particular user; currently limited to just 1 post, but will return a list anyways */
    let db = await getDb();
    return new Promise(function (resolve,reject) {      /* create a "promise", so that we can resolve it when we have the results */
        let collection = db.collection("posts");
        let query = { posterid: userid };
        collection.find(query).sort({date:-1}).limit(1).toArray(async function (err,result) {    /* search for posts */
            if (err) { console.log(err); reject(err); }
            let posts = [];
            for (let i=0; i < result.length; i++) {
                let r = result[i];
                let d = new Date(r.date);               /* re-format the date to be human-readable */
                r.date = d.toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"});
                posts.push(r);
                }
            resolve(posts);
            });
        });
    }



async function socialMyProfile(req, res) {
    if (!req.session.user) { res.redirect(`/social`); }
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


async function socialProfile(req, res) {
    if (!req.session.user) { res.redirect(`/social`); }
    let db = await getDb();
    let results = await db.collection("follows").find({follow: req.params.id, by: req.session.user._id}).toArray();
    let following = (results.length > 0);
    let collection = db.collection("posts");
    let query = { posterid: req.params.id };
    collection.find(query).sort({date:-1}).toArray(async function (err,result) {
        if (err) { console.log(err); return res.sendStatus(500); }
        let posts = [];
        for (let i=0; i < result.length; i++) {
            let r = result[i];
            let datestr = new Date(r.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"});
            let p = { date: datestr, text: r.posttext };
            posts.push(p);
            }
        let query2 = { _id: ObjectID(req.params.id) };
        db.collection("users").findOne(query2, async function (err,result2) {
            if (err) { console.log(err); return res.sendStatus(500); }
            let renderdata = { name: result2.screenname, id: req.params.id, profile: result2.profile, posts: posts, following: following };
            res.render('profile', renderdata);
            });
        });
    }


async function socialEditProfile(req, res) {
    res.render('editprofile', { profile: req.session.user.profile });
    }


async function socialSearch(req, res) {
    if (!req.session.user) { return res.redirect(`/social`); }
    let db = await getDb();
    let results = await db.collection("follows").find({by: req.session.user._id}).toArray();   /* get a list of people I follow, so the template can correctly include a "follow" or "unfollow" link */
    let following = [];
    for (let i=0; i < results.length; i++)         /* save the IDs in a simple list, to be able to use the ".includes()" function */
        following.push(results[i].follow);
    let collection = db.collection("users");
    let query = { screenname: new RegExp(`${req.body.searchterm}`,'i') };        /* query for people who match the search term */
    collection.find(query).toArray(async function (err,result) {
        if (err) { console.log(err); return res.sendStatus(500); }
        let users = [];
        for (let i=0; i < result.length; i++) {                                  /* save the results in an array for the EJS template */
            if (result[i]._id == req.session.user._id) continue;
            let u = { name: result[i].screenname, id: result[i]._id, following: following.includes(result[i]._id.toString()) };
            users.push(u);
            }
        res.set('Cache-Control','max-age: 1000');
        res.render('searchresults', { users: users });
        });
    }


async function socialNewPost(req, res) {
    if (!req.session.user) { res.redirect(`/social`); }
    let db = await getDb();
    let user = req.session.user;
    let obj = { postername: user.screenname, 
                posterid: user._id, 
                date: Date.now(), 
                posttext: req.body.posttext };
    db.collection("posts").insertOne(obj, function (err,result) {
        if (err) { console.log(err); return res.sendStatus(500); }
        res.redirect(`/social/myprofile`);
        });
    }


async function socialUpdateProfile(req, res) {
    if (!req.session.user) { res.redirect(`/social`); }
    let db = await getDb();
    let updatequery = { _id: ObjectID(req.session.user._id) };
    let newval = { $set: { profile: req.body.profile } };
    db.collection("users").updateOne(updatequery, newval, function (err,result) {
        if (err) { console.log(err); return res.sendStatus(500); }
        req.session.user.profile = req.body.profile;
        res.redirect(`/social/myprofile`);
        });
    }


async function socialFollow(req,res) {           /* follow another user */
    if (!req.session.user) { res.redirect(`/social`); }
    let db = await getDb();
    let collection = db.collection("follows");
    let obj = { follow: req.params.id, by: req.session.user._id };    /* the "follows" object contains my ID (the follower - "by") and the other user's ID (the followee - "follow") */
    let alreadyFollowing = await collection.count(obj);               /* check whether I'm already following them */
    if (alreadyFollowing == 0)                                        /* if not, add the new entry to the "follows" collection */
        {
        collection.insertOne(obj, function (err,result) {
            if (err) { console.log(err); return res.sendStatus(500); }
            res.redirect(`/social/profile/${req.params.id}`);         /* end by going to the other user's profile page */
            });
        }
    else
        res.redirect(`/social/profile/${req.params.id}`);
    }


async function socialUnfollow(req,res) {          /* stop following another user */
    if (!req.session.user) { res.redirect(`/social`); }
    let db = await getDb();
    let collection = db.collection("follows");
    let query = { follow: req.params.id, by: req.session.user._id };  /* create an object that would show that I follow the given user */
    collection.deleteOne(query, function (err,result) {               /* delete it, if it exists in the collection */
        if (err) { console.log(err); return res.sendStatus(500); }
        res.redirect(`/social/myprofile`);
        });
    }


async function socialFollowing(req, res) {         /* get a list of people that I'm following */
    if (!req.session.user) { return res.redirect(`/social`); }
    let db = await getDb();
    let results = await db.collection("follows").find({by: req.session.user._id}).toArray();   /* get the list; doing this synchronously so that I can then make another query to get complete user information */
    let following = [];
    for (let i=0; i < results.length; i++)
        following.push(results[i].follow);
    let collection = db.collection("users");
    collection.find({}).toArray(function (err,result) {    /* get data on all the users, to then search for info on the ones I'm following (NOTE: this is a crude replacement for a "join", trying to make it simpler to understand */
        if (err) { console.log(err); return res.sendStatus(500); }
        let users = [];
        for (let i=0; i < result.length; i++) {            /* for each user, if I'm following them, add them to the array used by the template */
            if (following.includes(result[i]._id.toString())) {
                users.push(result[i]);
                }
            }
        res.set('Cache-Control','max-age: 1000');
        res.render('following', { users: users });
        });
    }


async function socialFollowers(req, res) {        /* get a list of people who follow me */
    if (!req.session.user) { return res.redirect(`/social`); }
    let db = await getDb();
    let results = await db.collection("follows").find({follow: req.session.user._id}).toArray();   /* get the list synchronously */
    let followers = [];
    for (let i=0; i < results.length; i++)
        followers.push(results[i].by);
    results = await db.collection("follows").find({by: req.session.user._id}).toArray();    /* also get the list of who I'm following, so we can add the appropriate "follow" or "unfollow" link later */
    let following = [];
    for (let i=0; i < results.length; i++)
        following.push(results[i].follow);
    let collection = db.collection("users");
    collection.find({}).toArray(function (err,result) {    /* get data on all users, to search for the info on the ones following me */
        if (err) { console.log(err); return res.sendStatus(500); }
        let users = [];
        for (let i=0; i < result.length; i++) {            /* for each user, if they're following me, add them to the array used by the template */
            if (followers.includes(result[i]._id.toString())) {
                if (following.includes(result[i]._id.toString()))    /* inclde a flag indicating whether or not I'm following them back */
                    result[i].following = true;
                else
                    result[i].following = false;
                users.push(result[i]);
                }
            }
        res.set('Cache-Control','max-age: 1000');
        res.render('followers', { users: users });
        });
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
router.post('/social/newpost', socialNewPost);
router.post('/social/updateprofile', body('profile').escape(), socialUpdateProfile);
router.get('/social/follow/:id', socialFollow);
router.get('/social/unfollow/:id', socialUnfollow);
router.get('/social/following', socialFollowing);
router.get('/social/followers', socialFollowers);

module.exports = router;

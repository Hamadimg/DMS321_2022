const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function startSurvey(req, res) {
    if (req.session.surveyDone) {
        sess = req.session;
        var output = `<p>Hello, ${sess.name}</p>\n`;
        output += `<p>You said that Cookie Monster is ${sess.monster}, and that web cookies are ${sess.web}.</p>\n`;
        output += `<p>You also said that you have eaten ${sess.num} cookies in the past year.  Fascinating.</p>\n`;
        var sess_string = JSON.stringify(sess, null, 4);
        output += `<p>The complete Javascript object of your session looks like this:</p><pre>${sess_string}</pre>\n`;
        res.send(makeHTMLPage(output));
        }
    else {
        req.session.surveyDone = false;
        res.redirect('/cookiename.html');
        }
    }


function answerQ0(req, res) {
    req.session.name = req.body.name;
    res.redirect('/cookiemonster.html');
    }


function answerQ1(req, res) {
    req.session.monster = req.body.choice;
    res.redirect('/cookieweb.html');
    }


function answerQ2(req, res) {
    req.session.web = req.body.choice;
    res.redirect('/cookienum.html');
    }


function answerQ3(req, res) {
    req.session.num = req.body.num;
    req.session.surveyDone = true;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    storeAnswers(req.session, ip);
    res.redirect('/cookies');
    }


function storeAnswers(sess, ip) {
    client.connect(function (err) {
            if (err) { throw err; }
            var collection = client.db("test").collection("cookiesurvey");
            var obj = { name: sess.name, monster: sess.monster, web: sess.web, num: sess.num, ipaddr: ip, timestamp: Date() };
            collection.insertOne(obj, function (err,result) {
                if (err) { throw err; }
                client.close();
                });
            });
    }

function summary(req, res) {
    var output = `<h1>Survey results</h1>\n`;
    output += `<table border="1">\n`;
    output += `<tr><th>Name</th><th>cookie monster</th><th>web cookies</th><th>number eaten</th><th>IP address</th><th>timestamp</th></tr>\n`;
    client.connect(function (err) {
            if (err) { throw err; }
            var collection = client.db("test").collection("cookiesurvey");
            var query = { username: "Dave" };
            collection.find({}).toArray(function (err,result) {
                if (err) { throw err; }
                for (var i=0; i < result.length; i++)
                    {
                    output += `<tr>`;
                    output += `<td>${result[i].name}</td>`;
                    output += `<td>${result[i].monster}</td>`;
                    output += `<td>${result[i].web}</td>`;
                    output += `<td>${result[i].num}</td>`;
                    output += `<td>${result[i].ipaddr}</td>`;
                    output += `<td>${result[i].timestamp}</td>`;
                    output += `</tr>`;
                    }
                output += `</table>`;
                client.close();
                res.send(makeHTMLPage(output));
                });
            });
    }

const express = require('express');
var router = express.Router();

router.get('/cookies', startSurvey);
router.post('/cookies/q0', answerQ0);
router.post('/cookies/q1', answerQ1);
router.post('/cookies/q2', answerQ2);
router.post('/cookies/q3', answerQ3);
router.get('/cookies/summary', summary);

module.exports = router;

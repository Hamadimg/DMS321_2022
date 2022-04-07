/*
mymongo1.js, fixed to work when app.js is being run by Passenger.  Gets the "db" variable via a singleton which runs the client.connect command the first time it's used.
The functions need to be declared as "async" because we're using NodeJS v13; the most recent version of node supposedly allows "await" to be used without this, but we don't have that option currently.
*/
const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

var _db;
async function getDb() {
    if (!_db)
        {
        await client.connect();
        _db = await client.db("sample_mflix");
        }
    return _db;
    }


async function MongoSearch(req, response) {
    var query = { title: new RegExp(req.params.title,'i') };
    let db = await getDb();
    db.collection("movies").findOne(query,function (err,result) {
        if (err) { response.send(err); }
        response.send(makeHTMLPage(`<h1>${result.title}</h1><p>(${result.year})</p><p>${result.fullplot}</p>`));
        });
    }



const express = require('express');
let router = express.Router();

router.get('/search/:title', MongoSearch);

module.exports = router;

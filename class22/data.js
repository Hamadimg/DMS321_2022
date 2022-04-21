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


async function search(req, response) {
    var query = { title: new RegExp(req.params.title,'i') };
    let db = await getDb();
    db.collection("movies").findOne(query,function (err,result) {
        if (err) { response.send(err); }
        response.send(`<h1>${result.title}</h1><p>(${result.year})</p><p>${result.fullplot}</p>`);
        });
    }



const express = require('express');
let router = express.Router();

router.get('/search/:title', search);

module.exports = router;

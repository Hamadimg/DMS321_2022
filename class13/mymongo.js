const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function MongoSearch(req, response) {
    client.connect(err => {
            if (err) { throw err; }
            let collection = client.db("sample_mflix").collection("movies");
            let query = { title: new RegExp(req.params.title,'i') };
            collection.findOne(query,function (err,result) {
                if (err) { response.send(err); }
                response.send(makeHTMLPage(`<h1>${result.title}</h1><p>(${result.year})</p><p>${result.fullplot}</p>`));
                client.close();
                });
            });
    }

const express = require('express');
let router = express.Router();

router.get('/search/:title', MongoSearch);

module.exports = router;

module.exports.search = MongoSearch;

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function MongoSearch(req, response) {
    client.connect(err => {
            if (err) { throw err; }
            var collection = client.db("sample_mflix").collection("movies");
            var query = { title: new RegExp(req.params.title,'i') };
            collection.findOne(query,function (err,result) {
                if (err) { response.send(err); }
                response.send(makeHTMLPage(`<h1>${result.title}</h1><p>(${result.year})</p><p>${result.fullplot}</p>`));
                });
            });
    }

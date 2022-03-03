/* This is how the simple mongo app SHOULD work.
  Based on code from https://github.com/mongodb-developer/mern-stack-example/tree/main/mern/server
  In app.js, you would have the callback function for app.listen() call mymongo.init()
  This then makes a connection once at startup, and re-uses that connection for all queries.
  It works fine when run from the command line ("node app.js").
  But when run via Passenger, I always get an "Internal server error" on the first browser request; after that it works.  Can't access the Passenger error log to get a clue as to what's happening.
  So for now we have to make a new connection for every request.
*/
module.exports.search = MongoSearch;
module.exports.init = init;

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

var _db;
function init() {
    client.connect(function (err,db) {
        if (db)
            _db = db.db("sample_mflix");
        });
    }

function MongoSearch(req, response) {
    var query = { title: new RegExp(req.params.title,'i') };
    _db.collection("movies").findOne(query,function (err,result) {
        if (err) { response.send(err); }
        response.send(makeHTMLPage(`<h1>${result.title}</h1><p>(${result.year})</p><p>${result.fullplot}</p>`));
        });
    }

module.exports.search = MongoSearch;

const mongodb = require('mongodb');
const uri = "mongodb+srv://username:password@cluster0.1iikc.mongodb.net/sample_mflix?retryWrites=true&w=majority"
var mydb;

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

mongodb.MongoClient.connect(uri, function (err, dbo) {
        if (err) {
             throw err;
             }
        mydb = dbo.db("sample_mflix");
        });


function MongoSearch(req, xres) {
    var query = { title: new RegExp(req.params.title,'i') };
    mydb.collection("movies").findOne(query,function (err,res) {
        if (err) { throw err; }
        xres.send(makeHTMLPage(res.title));
        });
    }

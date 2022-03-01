module.exports.search = MongoSearch;

const mongodb = require('mongodb');
const uri = "mongodb+srv://username:password@cluster0.1iikc.mongodb.net/sample_mflix?retryWrites=true&w=majority"
var mydb;

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;


function MongoSearch(req, xres) {
    mongodb.MongoClient.connect(uri, function (err, dbo) {
        if (err) {
             throw err;
             }
        mydb = dbo.db("sample_mflix");
        var query = { title: new RegExp(req.params.title,'i') };
        mydb.collection("movies").findOne(query,function (err,res) {
            if (err) { throw err; }
            if (res)
                xres.send(makeHTMLPage("title:" + res.title));
            else
                xres.send(makeHTMLPage("nothing found"));
            });
        });
    }

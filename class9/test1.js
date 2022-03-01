const mongodb = require('mongodb');
const uri = "mongodb+srv://dave:b%40dp%40ss7@cluster0.1iikc.mongodb.net/sample_mflix?retryWrites=true&w=majority"

function myCallback(err, dbo) {
    if (err) {
             throw err;
             }
    var db = dbo.db("davetest");
    db.collection("somedata").insertOne({title:'Hello, World', director:'nobody'},function(err,res) { if (err) throw err; });
    var query = { title: new RegExp('ello','i') };
    db.collection("somedata").find(query).limit(3).toArray(function (err,res) {
        if (err) { throw err; }
        console.log(res);
        dbo.close();
        });
    }

mongodb.MongoClient.connect(uri, myCallback);

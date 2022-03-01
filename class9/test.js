const mongodb = require('mongodb');
const uri = "mongodb+srv://username:password@cluster0.1iikc.mongodb.net/sample_mflix?retryWrites=true&w=majority"

function myCallback(err, dbo) {
    if (err) { throw err; }
    var db = dbo.db("sample_mflix");
    var query = { }
    db.collection("movies").find(query).toArray(function (err,res) {
        if (err) { throw err; }
        for (var i=0; i < res.length; i++)
            {
            console.log(res[i].title);
            }
        dbo.close();
        });
    }

mongodb.MongoClient.connect(uri, myCallback);

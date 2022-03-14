const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    if (err) { throw err; }
    const collection = client.db("test").collection("mydata");

    var obj = { username: "Dave", post: "yadda yadda blah" };
    collection.insertOne(obj, function (err,result) {
        if (err) { throw err; }
        console.log("done");
        client.close();
        });
    });

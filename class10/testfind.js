const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    if (err) { throw err; }
    const collection = client.db("test").collection("mydata");

    var query = { username: "Dave" };
    collection.find(query).toArray(function (err,result) {
        if (err) { throw err; }
        for (var i=0; i < result.length; i++)
            {
            console.log(result[i]);
            }
        client.close();
        });
    });

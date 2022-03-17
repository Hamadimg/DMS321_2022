const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    if (err) { throw err; }
    const collection = client.db("test").collection("mydata");

    var query = { _id: ObjectId("6220fec6ecd74742ad59fe3a") };
    collection.find(query).toArray(function (err,result) {
        if (err) { throw err; }
        if (result.length == 0)
            console.log("nothing found");
        for (var i=0; i < result.length; i++)
            {
            console.log(result[i]);
            }
        client.close();
        });
    });

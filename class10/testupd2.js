const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    if (err) { throw err; }
    const collection = client.db("test").collection("mydata");

    var query = { username: "Dave" };
    collection.find(query).toArray(function (err,result) {
        if (err) { throw err; }
        for (var i=0; i < result.length; i++)
            {
            var updatequery = { _id: result[i]._id };
            var newval = { $set: { post: `said "${result[i].post}"!` } };
            console.log(`update ${result[i]._id}`);
            collection.updateOne(updatequery, newval, function (err,result2) {
                if (err) { throw err; }
                console.log(`${result2.modifiedCount} modified`);
                });
            }
/* Don't do this - it will break program because of asynchronous behavior */
/*        client.close(); */
        });
    });

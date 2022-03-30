/* Example script to add a user to my login database, with a hashed password */
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


client.connect(async err => {
    if (err) { throw err; }
    const collection = client.db("social").collection("users");

    let passwordhash = await bcrypt.hash('password', 10);
    let obj = { email: "depape@buffalo.edu", screenname: "Dave", password: passwordhash, profile: "a person on this site" };
    
    collection.insertOne(obj, function (err,result) {
        if (err) { throw err; }
        console.log("done");
        client.close();
        });
    });

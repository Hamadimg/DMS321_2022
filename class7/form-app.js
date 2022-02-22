// Note: rename this to just "app.js" when installing it on your website, for Passenger to use it

var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended:false})

const html1=`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>DMS 321 form demo</title>
</head>

<body>
`;

const html2=`
</body>
</html>
`;

app.get('/', function (req, res) {
   res.send('Hello World, from express');
})

app.get('/foo', function (req, res) {
   res.send('calling "foo" from express');
})

app.post('/submitform', urlencodedParser, function (req, res) {
   var answer = html1 + `<p>Hello, ${req.body.username}</p><p>Your message was:</p><pre>${req.body.message}</pre>` + html2;
   res.send(answer);
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
})

// Note: rename this to just "app.js" when installing it on your website, for Passenger to use it

var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended:false})

function makeHTMLPage(s)
    {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>DMS 321 form demo</title>
</head>

<body>
${s}
</body>
</html>
`;
    }

app.get('/', function (req, res) {
   res.send('Hello World, from express');
})

app.get('/rps/:choice', function (req, res) {
    var answer = makeHTMLPage('<p>You chose ${req.params.choice}</p>');
    res.send(answer);
})

app.post('/submitform', urlencodedParser, function (req, res) {
   var answer = makeHTMLPage(`<p>Hello, ${req.body.username}</p><p>Your message was:</p><pre>${req.body.message}</pre>`);
   res.send(answer);
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
})

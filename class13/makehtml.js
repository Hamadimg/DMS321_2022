module.exports.makeHTMLPage = function (s) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>DMS 321 nodejs demo</title>
<style>
body {
    font-family: arial;
    }
</style>
</head>

<body>
${s}
</body>
</html>
`;
    }

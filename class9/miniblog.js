module.exports.Blog = Blog;
module.exports.BlogPost = BlogPost;

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

var blogposts = [ ];

function Blog(req,res) {
    var output = '<h1>The Blog</h1>\n';
    for (i=0; i < blogposts.length; i++)
        {
        output += `<div><h2>${blogposts[i].title}</h2><p>posted ${blogposts[i].date}</p><p>message type: ${blogposts[i].type}</p><p>${blogposts[i].body}</p></div>\n`;
        }
    res.send(makeHTMLPage(output));
    }

function BlogPost(req, res) {
    var newpost = { 'title': req.body.title, 'date': Date(), 'type': req.body.messagetype, 'body': req.body.message };
    blogposts.push(newpost);
    res.redirect('/blog');
    }

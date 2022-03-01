module.exports.RPSChoice = RPSChoice;

const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

function choose(list)
    {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
    }

function RPSChoice(req, res) {
    var human = req.params.choice;
    var robot = choose(['rock', 'paper', 'scissors']);
    var output = `<p>You chose ${human}</p><p>I chose ${robot}</p>`;
    if (human == robot)
        output += '<p>It\'s a tie</p>';
    else if ((human == 'rock') && (robot == 'scissors'))
        output += '<p>You win!</p>';
    else if ((human == 'paper') && (robot == 'rock'))
        output += '<p>You win!</p>';
    else if ((human == 'scissors') && (robot == 'paper'))
        output += '<p>You win!</p>';
    else
        output += '<p>I win!</p>';
    output += '<p><a href="/rps.html">Play again?</a></p>';
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage(output));
    }


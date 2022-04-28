/* AJAX-based version of data-sharing example.
  This is extremely simplified, for the demo - it just keeps track of 3 pieces of
  information, and receiving it from or sending it to any client that makes a
  request. */

let userData = { x:0, y:0, dir: 0 }
  
function setData(req, res) {
    userData.x = parseFloat(req.params.x);
    userData.y = parseFloat(req.params.y);
    userData.dir = parseFloat(req.params.dir);
    res.send('');
    }

function getData(req, res) {
    let str = JSON.stringify(userData);
    res.send(str);
    }

const express = require('express');
let router = express.Router();

router.get('/set/:id/:x/:y/:dir', setData);
router.get('/get/:id', getData);

module.exports = router;

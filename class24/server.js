/* Super-simple network server using Websockets
  This server merely receives messages and re-broadcasts them to all other clients.
  Run "npm install ws" to install the needed NodeJS package.
*/

const { WebSocket, WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 7080 });

wss.on('connection', newConnection);

function newConnection(ws) {
    console.log('new connection');
    console.log(ws);
    ws.on('message', function (data) { receiveData(data,ws); });
    }

function receiveData(data,ws) {
    wss.clients.forEach(function (client) {
        if ((client != ws) && (client.readyState === WebSocket.OPEN)) {
            client.send(data, { binary: false });
            }
        });
    }

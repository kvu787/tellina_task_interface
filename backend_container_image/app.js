var pty = require('pty.js');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 10411 });

wss.on('connection', function connection(ws) {
  console.log(`Connection from ${ws.upgradeReq.url}`);
  
  var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cwd: '/home/me/website',
    env: process.env
  });

  term.on('data', function(data) {
    ws.send(data);
  });

  ws.on('message', function (message) {
    term.write(message);
  });
});

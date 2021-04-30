const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});
var listOfConnections = [];
wss.on('connection', function connection(ws, req) {
    const ip = req.socket.remoteAddress;

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        try {
            const myObj = JSON.parse(message);
            if (myObj.whoami){
                const you = myObj.whoami;
                console.log("you -> ", you);
                listOfConnections.push({"who":myObj.whoami,"ip":ip});
            }else if (myObj.operation){
                const operation = myObj.operation;
                const whoSend = myObj.whoSend;
                if (operation === "send"){
                    var bul = false;
                    listOfConnections.forEach(function each(connection) {
                        if (connection.who === whoSend){
                            bul = true;
                            wss.clients.forEach(function each(client) {
                                if (client._socket.remoteAddress === connection.ip){
                                    client.send(myObj.whatSend);

                                }
                            });
                        }
                    })
                }
            }
        }catch (ex){
            console.log("exception -> ", ex);
        }
    });
    ws.send('something');
    console.log("connection opened.")
    ws.on('close', function close(name) {
        console.log('disconnected', ip);
    });
});
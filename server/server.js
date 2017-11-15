'use strict';

const loopback = require('loopback'),
  boot = require('loopback-boot'),
  redis = require('redis'),
  busesActions = require('./sockets/buses');

const app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    let baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      let explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    
    // connect to the redis DB
    app.redisClient = redis.createClient({
      host: 'dindb'
    });

    // start the socket server
    app.io = require('socket.io')(app.start());

    // on every conection, set the busActions listeners
    app.io.on('connection', function(socket) {
      console.log('User connected');
      busesActions.busGet(socket, app);
      busesActions.busSet(socket, app);
    });        
  }
});

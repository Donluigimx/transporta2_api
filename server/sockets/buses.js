'use strict';
const redis = require('redis');

module.exports = {
    busGet: function(socket, app) {
        socket.on('busGet', function(data){
            if (validateBusGetData(data)) {
                app.redisClient.get(data.busId, function(err, reply) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (reply) {                        
                        socket.emit('busStatus', JSON.parse(reply));
                    }
                });
            }
        });
    },
    busSet: function(socket, app) {
        socket.on('busSet', function(data){
            if (validateBusSetData(data)) {                
                app.redisClient.get(data.busId, function(err, value) {
                    let save_data;
                    if (value) {
                        save_data = Object.assign(value, data);
                    } else {
                        save_data = Object.assign({
                            busStatus: '',
                            busFull: 0,
                        }, data);                    
                    }
                    app.redisClient.set(data.busId, JSON.stringify(save_data), redis.print);
                    app.io.emit('busStatus', data);
                });                
            }            
        });
    }
}

function validateBusGetData(data) {
    return data.hasOwnProperty('busId');
}

function validateBusSetData(data) {
    return data.hasOwnProperty('busId') && data.hasOwnProperty('lat') && data.hasOwnProperty('lng');
}
const express = require('express');
const cluster = require('cluster');
const net = require('net');
const socketio = require('socket.io');
const socketMain = require('./socketMain');
const port = 8181;
const numProcesses = require('os').cpus().length;
const io_redis = require('socket.io-redis');
const farmhash = require('farmhash');

if(cluster.isMaster){
    //Storing Our Workers to Build Sticky Sessions Based On thier IP Addresses.
    let workers = [];

    let spawn = function(i){
        // spawning worker at ith position
        workers[i] = cluster.fork();    
        
        // emits exit even whenever a worker stops
        workers[i].on('exit', function(code, signal){
            spawn(i);
        });    
    };
    // Spawning Workers on Multiple Threads
    for(var i = 0; i<numProcesses; i++){
        spawn(i);
    };

    const worker_index = function(ip, len){
        // hashinng user's ip to configure which worker to utilize for this ip
        return farmhash.fingerprint32(ip)%len;
    }
    // creating a TCP server to maintain sockets
    const server = net.createServer({pauseOnConnect: true}, (connection)=>{
        // getting the appropriate worker for a particular connection source's ip
        let worker = workers[worker_index(connection.remoteAddress, numProcesses)];
        worker.send('sticky-session: connection', connection);
    });
    server.listen(port);
    console.log(`Master Server Listening On Port: ${port}`);
}else{
    let app = express();
    const server = app.listen(0, 'localhost');
    const io = socketio(server);
    // Setting up redis adapter for updates amongst workers
    io.adapter(io_redis({host: 'localhost', port:6379}));

    io.on('connection', function(socket){
        socketMain(io, socket);
        console.log(`Connected to Worker: ${cluster.worker.id}`);
    });
    
    // If the connection is not meant for this worker thread, return
    process.on('message', function(message, connection){
        if(message!=='sticky-session: connection')
        return;

        // Emits connection event to fire connection recieved from the master server
        server.emit('connection', connection);
        connection.resume(); 
    })
}


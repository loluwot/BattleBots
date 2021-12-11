import path from 'path';
import express from 'express';
import socketIO from 'socket.io';
import { Lib } from 'lance-gg';
import NGameEngine from './common/NGameEngine';
import NServerEngine from './server/NServerEngine';
const PORT = process.env.PORT || 3000;
//const PORT = 80
const INDEX = path.join(__dirname, '../dist/select.html');
const GAME = path.join(__dirname, '../dist/index.html')
const fs = require('fs');
// define routes and socket
const server = express();


function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}


server.get('/', function(req, res) { 
    //console.log(req)
    let cookies = parseCookies(req)
    console.log(cookies)
    if (cookies && cookies['game']){
        res.sendFile(GAME); 
        res.clearCookie('game')
    }
    else{
        res.sendFile(INDEX)
    }
    
});
// server.use('/a', express.static(path.join(__dirname, '../dist/')));
server.use('/', express.static(path.join(__dirname, '../dist/')));
server.get('/filenames', function(req, res){
    console.log('GETTING FILENAMES')
    //let names = []
    fs.readdir('./dist/sprites/cards/', (err, files) => {
        res.send(files)
    });
    //res.send()
})

server.post('/', function(req, res){
    console.log('POST REQ')
    res.cookie('game', 'true')
    res.redirect('/')
})
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Instances
const gameEngine = new NGameEngine({ traceLevel: 1 });
// console.log(gameEngine)
const serverEngine = new NServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });
//console.log(serverEngine)
// start the game
serverEngine.start();

console.log('Server Started')

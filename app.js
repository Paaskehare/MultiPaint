
var express   = require('express')
  , app       = express()
  , http      = require('http')
  , server    = http.createServer(app)
  , io        = require('socket.io').listen(server)
  , rooms     = {}
  , nicknames = {};


function make_random()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

server.listen(3000);

// routing
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/:room', function(req, res, next) {
  var room = req.params.room;

  if (room.match(/^[a-z]{5}$/))
    res.sendfile(__dirname + '/index.html');
  else
    res.send(404);
});

var usernames = {};

io.sockets.on('connection', function(socket) {

  socket.nickname = "";
  socket.room     = "";

  /*socket.on('join', function(name) {
    if (rooms[name])
      socket.room = name;
      socket.join(socket.room);
    }
    socket.emit('joinRoom', {user: socket.nickname});
  });
  */

  socket.on('nickname', function(data) {

    var room = data.room;
    console.log(data.room);
    if (room && room.match(/^[a-z]{5}$/)) {

    } else {
      room = make_random();
    }

    nicknames[data.nick] = socket.nickname = data.nick;

    if (!rooms[room])
      rooms[room] = data.nick;
    socket.room = room;
    socket.join(room);
    socket.broadcast.to(room).emit('userJoined', {username: data.nick});

    socket.emit('hello', {room: room});
  });

  socket.on('clear', function(data) {
    if (socket.room) {
      if (rooms[socket.room] == socket.nickname) {
        socket.broadcast.to(socket.room).emit('clear', true);
        socket.emit('clear', true);
      } else
        socket.emit('clear', false);
    }
  });

  socket.on('msg', function(data) {
    if (socket.room)
      socket.broadcast.to(socket.room).emit('msg', {message: data.message, username: socket.nickname});
  });

  socket.on('paint', function(data) {
    console.log('Paint: ' + data.settings.tool);
    if (socket.room)
      socket.broadcast.to(socket.room).emit('painted', {options: data.settings, coords: data.coords});
  });
});

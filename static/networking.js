var socket = io.connect(location.host);

var room_name = location.pathname.substr(1);
var nickname = "";
var room = "";

var painting = {};

painting.Line = function(options, coords) {
  contexte.clearRect(0, 0, canvas.width, canvas.height);

  contexte.beginPath();
  contexte.moveTo(coords[0], coords[1]),
  contexte.lineTo(coords[2], coords[3]);
  contexte.lineWidth = options.size;
  contexte.strokeStyle = options.color;
  contexte.stroke();

  contexte.closePath();

  net_img_update();
};

painting.Pencil = function(options, coords) {
  contexte.beginPath();
  contexte.moveTo(coords[0][0], coords[0][1]);
  contexte.strokeStyle = options.color;
  contexte.lineWidth = options.size;

  for (var i=1; i < coords.length; i++) {
    contexte.lineTo(coords[i][0], coords[i][1]);
    contexte.stroke();
  }

  net_img_update();
};

painting.Rect = function(options, coords) {
  contexte.clearRect(0, 0, canvas.width, canvas.height);
  contexte.lineWidth = options.size;
  contexte.strokeStyle = options.color;

  if(!coords[2] || !coords[3])
    return;

  contexte.strokeRect(coords[0], coords[1], coords[2], coords[3]);

  net_img_update();
};

function appendMessage(username, msg) {
  $('#chat').append($(document.createElement('li')).append(
    $(document.createElement('span')).addClass('username').text(username)
  ).append(
    $(document.createElement('span')).addClass('message').text(msg)
  ));
}

$(document).ready(function() {

  socket.on('connect', function() {

  $('#message').bind('keypress', function(ev) {

    var message = $('#message').val();
    if (ev.which == 13 && message != "") {
      socket.emit('msg', {message: message});
      $('#message').val('');
      appendMessage(nickname, message);
    }
  });

  $('#submit').click(function() {
    nickname = $('#username').val();

    socket.emit('nickname', {nick: nickname, room: room_name});
  });

  socket.on('hello', function(data) {
    console.log(data.room);

    $('#link').text('http://' + location.host + '/' + data.room);
    initPaintApp();
  });

  socket.on('clear', function(clear) {
    if (clear)
      net_img_clear();
  });

  socket.on('msg', function(data) {
    console.log(data.message);
    appendMessage(data.username, data.message);
  });

  socket.on('userJoined', function(data) {
    appendMessage('*', data.username + ' has joined the room');
  });

  socket.on('painted', function(data) {
    console.log('received paint event');
    var paint = painting[data.options.tool];
    paint(data.options, data.coords);
  });

  });
});

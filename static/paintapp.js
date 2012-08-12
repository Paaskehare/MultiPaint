/*if(window.addEventListener) {

window.addEventListener('load', function () {*/

var canvaso = document.getElementById('image')
  , contexto = canvaso.getContext('2d')
  , container = canvaso.parentNode
  , canvas = document.createElement('canvas')
  , canvase = document.createElement('canvas')
  , contexte
  , context
  , recording = []
  , tool
  , tools = {}
  , color = {}
  , settings = {}
  , started = false
  , show_colors = false
  , show_sizes = false
  , toolbox = ['Pencil', 'Line', 'Rect']
  , sizes = {};

settings.color = "#000000";
settings.tool = "Pencil";
settings.size = 5;

canvaso.width = 800;
canvaso.height = 600;

sizes.small = "2";
sizes.medium = "4";
sizes.big = "8";
sizes.huge = "12";

color.black  = '#000000';
color.white  = '#ffffff';
color.green  = '#659b41';
color.red    = '#cc0000';
color.purple = '#cb3594';
color.yellow = '#ffcf33';
color.brown  = '#986928';

/* tools */
// Pencil
tools.Pencil = new (function() {
  this.started = false;
  this.cursor  = "pointer";

  this.emit_recording = function() {
    socket.emit('paint', {settings: settings, coords: recording});
    recording = [];
  };

  this.mousedown = function(ev) {
    recording = [];
    context.beginPath();
    context.moveTo(ev._x, ev._y);
    context.strokeStyle = settings.color;
    context.lineWidth = settings.size;
    recording.push([ev._x, ev._y]);
    this.started = true;
  };

  this.mousemove = function(ev) {
    if (this.started) {
      context.lineTo(ev._x, ev._y);
      context.lineJoin = 'round';
      context.stroke();
      if (recording.length > 200) {
        /* send recording */
        tool.emit_recording();
      }
      /* record step */
      recording.push([ev._x, ev._y]);
    }
  };

  this.mouseup = function(ev) {
    if (this.started) {
      tool.mousemove(ev);
      this.started = false;
      img_update();
      /* push and reset recording */
      tool.emit_recording();
    }
  };
});

// Rectangle
tools.Rect = new (function() {
  this.started = false;
  this.cursor  = "pointer";
    this.x = 0
  , this.y = 0
  , this.w = 0
  , this.h = 0;
  
  this.mousedown = function(ev) {
    this.started = true;
    this.x0 = ev._x;
    this.y0 = ev._y;
  };

  this.mousemove = function(ev) {
    if (this.started) {

      var x = Math.min(ev._x,  this.x0)
        , y = Math.min(ev._y,  this.y0)
        , w = Math.abs(ev._x - this.x0)
        , h = Math.abs(ev._y - this.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.lineWidth = settings.size;
      context.strokeStyle = settings.color;

      if(!w || !h)
        return;

      context.strokeRect(x, y, w, h);
        this.x = x
      , this.y = y
      , this.w = w
      , this.h = h;
    }
  };

  this.mouseup = function(ev) {
    if (this.started) {
      tool.mousemove(ev);
      this.started = false;

      img_update();

      /* Push coordinates */
      console.debug('X: ' + this.x);
      console.debug('Y: ' + this.y);

      /* These might need recalculating */

      console.debug(settings.tool);

      socket.emit('paint', {settings: settings, coords: [this.x, this.y, this.w, this.h]});
      console.debug('W: ' + this.w);
      console.debug('H: ' + this.h);
    }
  };
});

tools.Line = new (function() {
  this.started = false;
  this.cursor  = "pointer";

  this.mousedown = function(ev) {
    this.started = true;

    this.x0 = ev._x;
    this.y0 = ev._y;
  };

  this.mousemove = function(ev) {
    if (this.started) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(this.x0, this.y0),
      context.lineTo(ev._x, ev._y);
      context.lineWidth = settings.size;
      context.strokeStyle = settings.color;
      context.stroke();

      context.closePath();
    }
  };

  this.mouseup = function(ev) {
    if (this.started) {
      tool.mousemove(ev);
      this.started = false;

      img_update();

      /* Push coordinates */
      socket.emit('paint', {settings: settings, coords: [this.x0, this.y0, ev._x, ev._y]});
      console.debug('From: ' + this.x0 + ','+ this.y0 + ' To: ' + ev._x + ',' + ev._y);
    } 
  };  
});


function ev_canvas (ev) {
  // Firefox
  if (ev.layerX || ev.layerX == 0) {
    ev._x = ev.layerX;
    ev._y = ev.layerY;
  // Opera
  } else if (ev.offsetX || ev.offsetX == 0) { 
    ev._x = ev.offsetX;
    ev._y = ev.offsetY;
  }

  /* stop drawing if we leave the canvas */
  if (ev.type == 'mouseleave') {
    if (ev._x < canvas.width) ev._x = 0;
    if (ev._y < canvas.height) ev._y = 0;
    var func = tool['mouseup'];
    func(ev);
  }

  var func = tool[ev.type];

  if (func) {
    func(ev);
  }
}

function img_update() {
  contexto.drawImage(canvas, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function net_img_update() {
  contexto.drawImage(canvase, 0, 0);
  contexte.clearRect(0, 0, canvas.width, canvas.height);
}

function net_img_clear() {
  context.closePath();
  context.clearRect(0, 0, canvas.width, canvas.height);
  contexto.clearRect(0, 0, canvas.width, canvas.height);
}

function img_clear(ev) {
  socket.emit('clear', {});
}

function toggleColors() {
  $('#sizes ul').stop().fadeOut();
  show_sizes = false;
  if (show_colors) {
    show_colors = false;
    $('#colors ul').stop().fadeOut();
  } else {
    show_colors = true;
    $('#colors ul').stop().fadeIn();
  }
}

function toggleSizes() {
  $('#colors ul').stop().fadeOut();
  show_colors = false;
  if (show_sizes) {
    show_sizes = false;
    $('#sizes ul').stop().fadeOut();
  } else {
    show_sizes = true;
    $('#sizes ul').stop().fadeIn();
  }
}

function initPaintApp() {

  $('#login').hide();
  $('#paintapp').fadeIn();

  tool = tools.Pencil;

  canvas.id     = 'imageTemp';
  canvas.width  = canvaso.width;
  canvas.height = canvaso.height;

  canvase.id    = 'imageNet';
  canvase.width = canvaso.width;
  canvase.height = canvaso.width;

  /* Multiplayer drawing canvas */
  container.appendChild(canvase);
  contexte = canvase.getContext('2d');

  container.appendChild(canvas);
  context = canvas.getContext('2d');

  console.debug('init');
  canvas.addEventListener('mousedown',  ev_canvas, false);
  canvas.addEventListener('mousemove',  ev_canvas, false);
  canvas.addEventListener('mouseup',    ev_canvas, false);
  canvas.addEventListener('mouseleave', ev_canvas, false);

  /* Set the cursor for the current tool */
  $('canvas').css('cursor', tool.cursor);

  /* Bind tool buttons */

  $.each(toolbox, function(index, value) {
    $('#tool_' + value).click(function() {
      $('#tool_' + settings.tool).removeClass('selected');
      settings.tool = value;
      tool = tools[settings.tool];

      $('canvas').css('cursor', tool.cursor);
      $(this).addClass('selected');
    });
  });

  /* Stop drawing if we leave the canvas */

  $.each(color, function(key, value) {
    $('#colors ul').append(
      $(document.createElement('li')).append(
      $(document.createElement('span')).css('background', value).attr('color', key).click(function() {
       settings.color = value;
       $('#cur_color span').css('background', value);
       $('#colors ul').stop().fadeOut();
       show_colors = false;
     }))
    );
    console.debug(value);
  });

  $('#sizes li').click(function() {
    var size = $(this).find('span').attr('size');
    settings.size = sizes[size];
    console.debug(size);
    $('#cur_size span').attr('class', 'brush ' + size);
    $('#sizes ul').stop().fadeOut();
  });

  $('#cur_color').click(toggleColors);

  $('#cur_size').click(toggleSizes);

  document.getElementById('tool_New').addEventListener('click', img_clear, false);
}

/*}, false); }*/

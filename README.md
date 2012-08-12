# MultiPaint

Multiplayer Paint application using node.js and socket.io

#### Node Module Requirements:
 - node.js
 - socket.io
 - express 

Multiroom paint application, still missing possibility to send the drawing after a new person joins the room.

#### How does it work?
Visit the page, choose a nickname, and start drawing.
Uses HTML 5 canvas to draw the picture, and sends it via websockets using socket.io

Tools of trade are: Pencil, Lines, Square  
Possible to change brush size and color of strokes.

Each room has a unique identifier you can link to have people join your conversation.

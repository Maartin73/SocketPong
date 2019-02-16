var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var players = {};
var myNum = 1;

'use strict';
var paddleLeftTop = 0;
var paddleRightTop = 0;
var paddleLeftHeight = 200;
var paddleRightHeight = 200;
paddleLeftTop= 0;
paddleRightTop = 0;
var ballXPos = 50;
var ballYPos = 50;
var ballXDir = 5;
var ballYDir = 5;
var ballWidth = 20;
var ballHeight = 20;
var wWidth;
var wHeigth;

var paddleRightDirection = 0;
var paddleRightTimer;
var paddleLeftDirection = 0;
var paddleLeftTimer;

var rightScore = 0;
var leftScore = 0;

function moveBall() {
  var newBallXPos = ballXPos + ballXDir;
  var newBallYPos = ballYPos + ballYDir;
  if (newBallXPos + ballWidth > wWidth) {
    ballXDir = -Math.abs(ballXDir);
  }
  if (newBallYPos + ballHeight > wHeigth) {
    ballYDir = -Math.abs(ballYDir);
  }
  if (newBallXPos < 0) {
    ballXDir = Math.abs(ballXDir);
  }
  if (newBallYPos < 0) {
    ballYDir = Math.abs(ballYDir);
  }
  ballXPos += ballXDir;
  ballYPos += ballYDir;
  if (ballXPos < 20 && 
    (ballYPos + 20 < paddleLeftTop || 
     ballYPos > paddleLeftTop + paddleLeftHeight)) {
    rightScore += 1;
  }
  if (ballXPos + 20 > wWidth - 20 && 
    (ballYPos + 20 < paddleRightTop || 
     ballYPos > paddleRightTop + paddleRightHeight)) {
    leftScore += 1;
  }
}

function moveRightPaddle() {
  paddleRightTop += paddleRightDirection;
}
function moveLeftPaddle() {
  paddleLeftTop += paddleLeftDirection;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let user1 = 1;
let user2 = 2;
/*setInterval(function() {
  if (ballXDir < 50) ballXDir *= 1.1;
  if (ballYDir < 50) ballYDir *= 1.1;
}, 10000); */
io.on('connection', function(socket){
    if (user1 === 1) {
      user1 = socket;
      console.log('user1');
    }
    else if (user2 === 2) {
      user2 = socket;
      console.log('user2');
    }

    if (user1 != 1 && user2!=2) {
      setInterval(function(){ moveBall(); 
        user1.emit('ballProperties', ballXPos, ballYPos, rightScore, leftScore);
        user2.emit('ballProperties', ballXPos, ballYPos, rightScore, leftScore); }, 25);

      user1.on('window', function(width, height){
        wWidth=width;
        wHeigth=height;
        moveBall();
        user1.emit('ballProperties', ballXPos, ballYPos, rightScore, leftScore);
        user2.emit('ballProperties', ballXPos, ballYPos, rightScore, leftScore);
      });

      user2.on('window', function(width, height){
        wWidth=width;
        wHeigth=height;
        moveBall();
        user1.emit('ballProperties', ballXPos, ballYPos, rightScore, leftScore);
        user2.emit('ballProperties', ballXPos, ballYPos, rightScore, leftScore);
      });
  
      user1.on('ArrowDown', function(){
        if (!paddleLeftTimer && user1) {
          paddleLeftDirection = 10;
          paddleLeftTimer = setInterval(moveLeftPaddle, 100);
          moveLeftPaddle();
          user1.emit('LeftPaddleProps', paddleLeftTop);
          user2.emit('LeftPaddleProps', paddleLeftTop);
          moveBall();
        }
      });

      user2.on('ArrowDown', function(){
        if (!paddleRightTimer) {
          paddleRightDirection = 10;
          paddleRightTimer = setInterval(moveRightPaddle, 100);
          moveRightPaddle();
          user1.emit('RightPaddleProps', paddleRightTop);
          user2.emit('RightPaddleProps', paddleRightTop);
          moveBall();
        }
      });
  
      user1.on('ArrowUpKeyUp', function(){
          clearInterval(paddleLeftTimer);
          paddleLeftTimer = null;
          moveBall();
      });

      user2.on('ArrowUpKeyUp', function(){
          clearInterval(paddleRightTimer);
          paddleRightTimer = null; 
          moveBall();
      });
  
      user1.on('ArrowUp', function(){
        if (!paddleLeftTimer) {
          paddleLeftDirection = -10;
          paddleLeftTimer = setInterval(moveLeftPaddle, 100);
          moveLeftPaddle();
          user1.emit('LeftPaddleProps', paddleLeftTop);
          user2.emit('LeftPaddleProps', paddleLeftTop);
          moveBall();
        }
      });

      user2.on('ArrowUp', function(){
        if (!paddleRightTimer) {
          paddleRightDirection = -10;
          paddleRightTimer = setInterval(moveRightPaddle, 100);
          moveRightPaddle();
          user1.emit('RightPaddleProps', paddleRightTop);
          user2.emit('RightPaddleProps', paddleRightTop);
          moveBall();
        }
      });

      user1.on('disconnect', function () {
        if (user1 === socket) user1 = 1;
      });

      user2.on('disconnect', function () {
        if (user2 === socket) user2 = 2;
      });
    }
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
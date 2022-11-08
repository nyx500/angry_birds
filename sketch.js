// Example is based on examples from: http://brm.io/matter-js/, https://github.com/shiffman/p5-matter
// add also Benedict Gross credit

// Bird sound from:
// https://mixkit.co/free-sound-effects/bird/
// "Creaking cartoon bird calling"

// Falling sound from:
// https://freesound.org/people/wertstahl/sounds/409284/

// Background image from:
// https://www.freepik.com/free-photo/cloud-blue-sky_1017702.htm#query=sky%20cloud%20background&position=0&from_view=keyword
// Image by jannoon028 on Freepik

// Cloud image from:
// https://freesvg.org/cloud-outline-silhouette

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Constraint = Matter.Constraint;
var Mouse = Matter.Mouse;
var MouseConstraint = Matter.MouseConstraint;
var Composite = Matter.Composite;
var Composites = Matter.Composites;

var engine;
var propeller;
var boxes = [];
var birds = [];
// array storing colors of boxes
var colors = [];
var ground;
var slingshotBird, slingshotConstraint;
var angle = 0;
var angleSpeed = 0;
var canvas;
// timer storing seconds left until game over
var timer;
var birdSound;
var birdSoundPlayed;
var boxRemovedSound;
/* an array which will store objects for each kind of bird's color palette
body, beak and eye colors
*/
var birdColors = [];
// variable which will store the background image of the sky
var backgroundImage;
// variable which will let the cloud's opacity fade when slingshot is fired
var cloudOpacity;
// stores bird which stops user's birds getting to the tower as an obstacle
var hangingBird, hangingBirdConstraint;

function preload() {
  // loads bird squawking sound
  birdSound = loadSound('./sounds/bird.wav');
  // loads bird squawking sound
  boxRemovedSound = loadSound('./sounds/falling_sound.wav');
  // loads background image
  backgroundImage = loadImage('./images/clouds.jpg');
}

////////////////////////////////////////////////////////////
function setup() {
  birdSoundPlayed = false;

  // defines 6 different bird color palettes
  birdColors = [
    {
      bodyColor: color(0, 0, 0),
      beakColor: color(255, 225, 0),
      eyeColor: color(255, 255, 102)
    },
    {
      bodyColor: color(0, 204, 102),
      beakColor: color(255, 51, 153),
      eyeColor: color(153, 0, 153)
    },
    {
      bodyColor: color(250, 250, 0),
      beakColor: color(255, 128, 0),
      eyeColor: color(51, 255, 51)
    },
    {
      bodyColor: color(102, 0, 102),
      beakColor: color(201, 201, 0),
      eyeColor: color(255, 0, 0)
    },
    {
      bodyColor: color(255, 255, 255),
      beakColor: color(155, 128, 0),
      eyeColor: color(0, 128, 255)
    },
    // stores colors for special slingshot bird are here at index 5
    {
      bodyColor: color(255, 165, 0),
      beakColor: color(255, 178, 102),
      eyeColor: color(204, 102, 0)
    },
    // stores colors for special obstacle bird are here at index 6
    {
      bodyColor: color(255, 0, 0),
      beakColor: color(0, 0, 0),
      eyeColor: color(0, 0, 0)
    },
  ];

  // set start cloud opacity to 255
  cloudOpacity = 255;

  canvas = createCanvas(1000, 600);

  engine = Engine.create();  // create an engine

  setupGround();

  setupPropeller();

  setupTower();

  setupSlingshot();

  setupMouseInteraction();

  setupHangingBird();

  // timer for countdown, set at 60 seconds at beginning of game
  timer = 60;

  // sets frame rate to 60 frames per second (to use in timer)
  frameRate(60);

}
////////////////////////////////////////////////////////////
function draw() {
  background(backgroundImage);
  Engine.update(engine);

  drawGround();

  drawPropeller();

  drawTower();

  drawBirds();

  drawSlingshot();

  drawHangingBird();

  drawCloud(200, height / 3 - 50);

  // draws the timer on the top left
  drawTimer();

  /* decrements the timer and shows game over if the timer is 0 
  and there are still boxes left on the screen,
  or a success message if there are not */
  countdown();
}
////////////////////////////////////////////////////////////
//use arrow keys to control propeller
function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    //your code here
    angleSpeed += 0.01;
  }
  else if (keyCode == RIGHT_ARROW) {
    //your code here
    angleSpeed -= 0.01;
  }
}
////////////////////////////////////////////////////////////
function keyTyped() {
  //if 'b' create a new bird to use with propeller
  if (key === 'b') {
    setupBird();
  }

  //if 'r' reset the slingshot
  if (key === 'r') {
    removeFromWorld(slingshotBird);
    removeFromWorld(slingshotConstraint);
    setupSlingshot();
  }
}

//**********************************************************************
//  HELPER FUNCTIONS - DO NOT WRITE BELOW THIS line
//**********************************************************************

//if mouse is released destroy slingshot constraint so that
//slingshot bird can fly off
function mouseReleased() {
  setTimeout(() => {
    if (!birdSoundPlayed) {
      birdSound.play();
      birdSoundPlayed = true;
    }
    slingshotConstraint.bodyB = null;
    slingshotConstraint.pointA = { x: 0, y: 0 };
  }, 100);
}
////////////////////////////////////////////////////////////
//tells you if a body is off-screen
function isOffScreen(body) {
  var pos = body.position;
  return (pos.y > height || pos.x < 0 || pos.x > width);
}
////////////////////////////////////////////////////////////
//removes a body from the physics world
function removeFromWorld(body) {
  World.remove(engine.world, body);
}
////////////////////////////////////////////////////////////
function drawVertices(vertices) {
  beginShape();
  for (var i = 0; i < vertices.length; i++) {
    vertex(vertices[i].x, vertices[i].y);
  }
  endShape(CLOSE);
}
////////////////////////////////////////////////////////////
function drawConstraint(constraint) {
  push();
  var offsetA = constraint.pointA;
  var posA = { x: 0, y: 0 };
  if (constraint.bodyA) {
    posA = constraint.bodyA.position;
  }
  var offsetB = constraint.pointB;
  var posB = { x: 0, y: 0 };
  if (constraint.bodyB) {
    posB = constraint.bodyB.position;
  }
  strokeWeight(3);
  stroke(255);
  line(
    posA.x + offsetA.x,
    posA.y + offsetA.y,
    posB.x + offsetB.x,
    posB.y + offsetB.y
  );
  pop();
}

// decrements the timer every second by 1
// calls gameOver() when timer is -1 and there are still boxes left
// calls success() if there are no boxes left
// -1 used instead of 0, because if I set this to 0,
// then the timer message on the top-left corner gets stuck at 1
function countdown() {
  if (frameCount % 60 == 0 && timer > -1) {
    timer--;
  }

  /* once timer reaches 0, if all the boxes have been cleared off the screen
     prints success message, else prints game over and stops the loop
  */
  if (timer == -1) {
    if (boxes.length == 0) {
      success();
    }
    else {
      gameOver();
    }
  }
}

// draws message on top-left hand corner telling user how many minutes left
function drawTimer() {
  textSize(22);
  fill(0);
  text("Remaining time: " + timer + " seconds", 10, 30);
}

//////////////////////////////////////////////////
// ends the game by stopping the draw loop and displaying "Game Over"
function gameOver() {
  fill(255, 0, 0);
  textSize(80);
  textAlign(CENTER);
  text("GAME OVER", width / 2, height / 2);
  noLoop();
}

// ends the game by stopping the draw loop and displaying success message
function success() {
  fill(255, 0, 0);
  textSize(40);
  textAlign(CENTER);
  text("YOU HAVE WON THE GAME!", width / 2, height / 2);
  noLoop();
}

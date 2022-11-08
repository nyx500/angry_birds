////////////////////////////////////////////////////////////////
function setupGround() {
  ground = Bodies.rectangle(500, 600, 1000, 40, {
    isStatic: true, angle: 0
  });
  World.add(engine.world, [ground]);
}

////////////////////////////////////////////////////////////////
function drawGround() {
  push();
    fill(128);
    drawVertices(ground.vertices);
  pop();
}
////////////////////////////////////////////////////////////////
function setupPropeller() {
  // your code here
  propeller = Bodies.rectangle(150, 480, 200, 15, {
    isStatic: true,
    angle: angle
  });

  World.add(engine.world, [propeller]);

}

////////////////////////////////////////////////////////////////
//updates and draws the propeller
function drawPropeller() {
  Body.setAngle(propeller, angle);
  Body.setAngularVelocity(propeller, angleSpeed);
  angle += angleSpeed;
  push();
    fill(255, 0, 0);
    stroke(0);
    drawVertices(propeller.vertices);
  pop();
}

////////////////////////////////////////////////////////////////
function setupBird() {
  // creates a circle body where the mouse is of radius 20, no friction,
  // bird is very bouncy because restitution is quite high
  var bird = Bodies.circle(mouseX, mouseY, 20, {
    friction: 0,
    restitution: 0.95
  });
  // set relatively large mass for the bird (will increase its force)
  // force (N) = mass * acceleration
  Matter.Body.setMass(bird, bird.mass * 10);
  // adds the bird to the world
  World.add(engine.world, [bird]);
  // adds bird to global 'birds' array
  var birdObject = {
    birdBody: bird,
    birdColor: birdColors[Math.floor(random(0, 5))]
  }
  birds.push(birdObject);
}

////////////////////////////////////////////////////////////////
// draws birds with a beak and an eye
function drawBirds() {
  for (let i = 0; i < birds.length; i++) {
    if (isOffScreen(birds[i].birdBody)) {
      removeFromWorld(birds[i]);
      birds.splice(i, 1);
      i--;
    }
    else {
      push();
        fill(birds[i].birdColor.bodyColor);
        stroke(0);
        // draws bird's body
        drawVertices(birds[i].birdBody.vertices);
        // translates to center of the bird
        push();
          translate(
            birds[i].birdBody.position.x,
            birds[i].birdBody.position.y
          );
          // draws beak
          fill(birds[i].birdColor.beakColor);
          triangle(15, - 10, 15, 10, 30, 0);
          // draws eye
          fill(birds[i].birdColor.eyeColor);
          ellipse(5, - 5, 10);
          fill(0);
          ellipse(5, -5, 5);
        pop();
      pop();
    }
  }
}

////////////////////////////////////////////////////////////////
//creates a tower of boxes
function setupTower() {
  //your code here
  var xPos = width / 1.4;
  for (let i = 0; i < 3; i++) {
    var yPos = ground.vertices[1].y;

    for (let j = 0; j < 6; j++) {
      let box = Bodies.rectangle(xPos, yPos, 80, 80);
      boxes.push(box);
      World.add(engine.world, [box]);
      yPos -= 80;
    }

    xPos += 80;
  }

  for (let i = 0; i < 18; i++) {
    let red = random(0, 20);
    let green = random(50, 255);
    let blue = random(0, 20);
    let boxColor = color(red, green, blue);
    colors.push(boxColor);
  }
}

////////////////////////////////////////////////////////////////
//draws tower of boxes
function drawTower() {
  for (var i = 0; i < boxes.length; i++) {
    // if box goes off screen, remove it from the boxes array
    if (boxes[i].vertices[0].x > width) {
      boxes.splice(i, 1);
      // play 'plonk' sound when box is removed
      boxRemovedSound.play();
      // decrement i, so array-iteration doesn't break
      i--;
    }
    else {
      push();
        noStroke();
        fill(colors[i]);
        drawVertices(boxes[i].vertices);
      pop();
    }
  }
}

////////////////////////////////////////////////////////////////
function drawCloud(x, y) {

  // if the slingshotBird is off-screen, fade the cloud by reducing opacity
  if (isOffScreen(slingshotBird)) {
    cloudOpacity -= 10;
  }

  // draws the cloud  
  push();
    translate(x, y);
    noStroke();
    fill(255, cloudOpacity);
    beginShape();
      ellipse(- 30, 0, 55, 42);
      ellipse(0, 0, 60, 50);
      ellipse(30, 0, 50, 42);
    endShape();
  pop();
}

/////////////////////////////////////////////////////////////////
function setupSlingshot() {
  //your code here
  slingshotBird = Bodies.circle(200, height / 3, 20, {
    friction: 0,
    restitution: 0.95
  });
  Matter.Body.setMass(slingshotBird, slingshotBird.mass * 10);

  slingshotConstraint = Constraint.create({
    // no bodyA, just a pointA on the world
    pointA: { x: slingshotBird.position.x, y: slingshotBird.position.y - 25 },
    bodyB: slingshotBird,
    // values relative to 0, 0 (a bit to the left and up from the center)
    pointB: { x: 0, y: 0 },
    stiffness: 0.01,
    damping: 0.0001
  });

  World.add(engine.world, [slingshotBird, slingshotConstraint]);
}

////////////////////////////////////////////////////////////////
//draws slingshot bird and its constraint
function drawSlingshot() {
  // draws the constraint
  drawConstraint(slingshotConstraint);
  // draws the bird
  push();
    fill(birdColors[5].bodyColor);
    stroke(0);
    drawVertices(slingshotBird.vertices);
    push();
      // translates to bird centre
      translate(
        slingshotBird.position.x,
        slingshotBird.position.y
      );
      // draws beak
      fill(birdColors[5].beakColor);
      triangle(15, - 10, 15, 10, 30, 0);
      // draws eye
      fill(birdColors[5].eyeColor); 
      ellipse(7, - 5, 10);
      fill(0);
      ellipse(7, -5, 5);
    pop();
  pop();
}

/////////////////////////////////////////////////////////////////
function setupMouseInteraction() {
  var mouse = Mouse.create(canvas.elt);
  var mouseParams = {
    mouse: mouse,
    constraint: { stiffness: 0.05 }
  }
  mouseConstraint = MouseConstraint.create(engine, mouseParams);
  mouseConstraint.mouse.pixelRatio = pixelDensity();
  World.add(engine.world, mouseConstraint);
}

/////////////////////////////////////////////////////////////////
// creates body and constraint for big red hanging bird in canvas center
function setupHangingBird() {
  hangingBird = Bodies.circle(450, height / 2, 50, {
    friction: 0,
    restitution: 1
  });
  Matter.Body.setMass(hangingBird, hangingBird.mass * 7);

  hangingBirdConstraint = Constraint.create({
    pointA: { x: hangingBird.position.x, y: hangingBird.position.y - 600 },
    bodyB: hangingBird,
    pointB: { x: 0, y: -40 },
    stiffness: 0.0006,
    damping: 0.001
  });

  World.add(engine.world, [hangingBird, hangingBirdConstraint]);
}

/////////////////////////////////////////////////////////////////
function drawHangingBird() {
  // draws constraint
  drawConstraint(hangingBirdConstraint);

  stroke(0);
  // draws bird's body
  fill(birdColors[6].bodyColor);
  drawVertices(hangingBird.vertices);

  // draws bird's eye, beak and eyebrow
  noStroke();
  // translates to center of bird
  push();
    translate(
      hangingBird.position.x,
      hangingBird.position.y
    );
    // draws beak
    fill(birdColors[6].beakColor);
    triangle(-40, - 20, -40, 20, -90, 0);
    // draws eye
    fill(birdColors[6].eyeColor);
    ellipse(0, - 15, 25);
    fill(255);
    ellipse(0, -15, 8);
    // draws angry eyebrow
    stroke(0);
    strokeWeight(7);
    strokeCap(SQUARE);
    line(-15, -30, 10, -40);
  pop();
}
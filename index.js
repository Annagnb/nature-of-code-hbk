// index.js

let branches = [];

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('canvas-container');
  angleMode(DEGREES);
  noFill();

  for (let i = 0; i < 20; i++) {
    let start = createVector(random(width), random(height));
    let dir = p5.Vector.fromAngle(random(-PI / 2, PI / 2));
    branches.push(new Branch(start, dir, random(40, 70), 0));
  }
}

function draw() {
  background(255);
  let t = frameCount * 0.01;
  let windStrength = map(noise(t), 0, 1, -0.4, 0.4);
  windStrength += sin(t * 2.3) * 0.6;
  let wind = createVector(windStrength, 0);

  for (let b of branches) {
    b.applyWind(wind);
    b.update();
    b.display();
  }
}

class Branch {
  constructor(origin, dir, length, depth) {
    this.origin = origin;
    this.dir = dir;
    this.length = length;
    this.depth = depth;

    this.k = map(depth, 0, 5, 0.25, 0.05);
    this.node = new LeafNode(
      origin.x + dir.x * length,
      origin.y + dir.y * length,
      this.k
    );

    this.children = [];
    if (depth < 4) {
      let splits = floor(random(1, 3));
      for (let i = 0; i < splits; i++) {
        let newDir = dir.copy().rotate(random(-30, 30));
        let newLen = length * random(0.6, 0.8);
        this.children.push(
          new Branch(this.node.origin.copy(), newDir, newLen, depth + 1)
        );
      }
    } else {
      this.leaf = true;
    }
  }

  applyWind(force) {
    this.node.applyWind(force);
    for (let c of this.children) c.applyWind(force);
  }

  update() {
    this.node.update();
    for (let c of this.children) c.update();
  }

  display() {
    stroke(0);
    strokeWeight(map(this.depth, 0, 4, 2, 0.5));
    line(this.origin.x, this.origin.y, this.node.pos.x, this.node.pos.y);

    for (let c of this.children) c.display();
    if (this.leaf) this.node.displayLineLeaf();
  }
}

class LeafNode {
  constructor(x, y, k) {
    this.origin = createVector(x, y);
    this.pos = this.origin.copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.k = k;
    this.damping = 0.9;
  }

  applyWind(force) {
    this.acc.add(force);
  }

  update() {
    let spring = p5.Vector.sub(this.origin, this.pos);
    spring.mult(this.k);
    this.acc.add(spring);
    this.vel.add(this.acc);
    this.vel.mult(this.damping);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  displayLineLeaf() {
    stroke(0);
    strokeWeight(0.7);
    let dir = p5.Vector.sub(this.pos, this.origin).normalize().mult(8);
    line(this.pos.x, this.pos.y, this.pos.x + dir.x, this.pos.y + dir.y);
  }
}

// sketch2.js
let strauchSketch = function(p) {
  let branches = [];
  let windTime = 0;
  
  p.setup = function() {
    let canvas = p.createCanvas(600, 400);
    canvas.parent('sketch2');
    
    // Mehr Ausgangspunkte über die gesamte Breite
    for(let x = 50; x < p.width; x += 30) {
      createBranch(x, p.height, -90, p.random(30, 50));
    }
  }
  
  function createBranch(x, y, angle, length) {
    if(length < 8) return; // Kleinere Endverzweigungen
    
    let branch = {
      start: p.createVector(x, y),
      angle: angle + p.random(-15, 15),
      length: length,
      thickness: p.map(length, 50, 8, 2, 0.3)
    };
    
    branches.push(branch);
    
    // Mehr Verzweigungen für dichteres Aussehen
    let branchCount = p.floor(p.random(2, 5));
    for(let i = 0; i < branchCount; i++) {
      let newX = x + p.cos(p.radians(branch.angle)) * length;
      let newY = y + p.sin(p.radians(branch.angle)) * length;
      let newAngle = branch.angle + p.random(-40, 40);
      createBranch(newX, newY, newAngle, length * p.random(0.6, 0.85));
    }
  }
  
  p.draw = function() {
    p.background(255);
    windTime += 0.005; // Langsamere Windänderung
    
    branches.forEach(branch => {
      // Komplexere Windsimulation
      let baseWind = p.noise(windTime + branch.start.y * 0.02) * 15;
      let gustEffect = p.sin(windTime * 2) * p.noise(windTime * 3) * 10;
      let heightEffect = p.map(branch.start.y, p.height, 0, 0.2, 1.2);
      
      let windAngle = branch.angle + (baseWind + gustEffect) * heightEffect;
      
      let endX = branch.start.x + p.cos(p.radians(windAngle)) * branch.length;
      let endY = branch.start.y + p.sin(p.radians(windAngle)) * branch.length;
      
      p.stroke(0);
      p.strokeWeight(branch.thickness);
      p.line(branch.start.x, branch.start.y, endX, endY);
    });
  }
}

new p5(strauchSketch);

let tree;
let branchData;
let barkTexture;
let leafImages = [];
let skyBuffer;
let groundBuffer;

function preload() {
  barkTexture = createGraphics(100, 100);
  drawBarkTexture(barkTexture);
  
  for (let i = 0; i < 3; i++) {
    let leaf = createGraphics(30, 30);
    drawLeafShape(leaf, i);
    leafImages.push(leaf);
  }
}

function drawBarkTexture(g) {
  g.background(80, 50, 20);
  g.noiseSeed(999);
  for (let x = 0; x < g.width; x++) {
    for (let y = 0; y < g.height; y++) {
      let n = noise(x * 0.1, y * 0.1);
      let c = n * 50;
      g.stroke(80 + c, 50 + c * 0.5, 20 + c * 0.2, 100);
      g.point(x, y);
    }
  }
  for (let i = 0; i < 50; i++) {
    g.stroke(40, 20, 10);
    g.strokeWeight(random(1, 3));
    g.line(
      random(g.width), random(g.height),
      random(g.width), random(g.height)
    );
  }
}

function drawLeafShape(g, type) {
  g.clear();
  g.noStroke();
  let leafColor;
  
  switch(type) {
    case 0:
      leafColor = color(100, 180, 100);
      g.fill(leafColor);
      g.ellipse(15, 15, 25, 15);
      g.fill(red(leafColor) * 0.7, green(leafColor) * 0.7, blue(leafColor) * 0.7);
      g.ellipse(15, 15, 15, 8);
      break;
    case 1:
      leafColor = color(120, 160, 80);
      g.fill(leafColor);
      g.beginShape();
      g.vertex(15, 5);
      g.bezierVertex(25, 5, 28, 15, 15, 25);
      g.bezierVertex(2, 15, 5, 5, 15, 5);
      g.endShape();
      break;
    case 2:
      leafColor = color(80, 140, 90);
      g.fill(leafColor);
      g.beginShape();
      for (let a = 0; a < TWO_PI; a += PI/10) {
        let r = 12 + sin(a * 5) * 3;
        g.vertex(15 + cos(a) * r, 15 + sin(a) * r);
      }
      g.endShape(CLOSE);
      break;
  }
}

function setup() {
  let canvas = createCanvas(800, 600, { willReadFrequently: true });
  canvas.parent('canvas-container');
  frameRate(30);
  textFont('Arial');
  
  // Create buffers for static sky and ground
  skyBuffer = createGraphics(width, height);
  groundBuffer = createGraphics(width, height);
  drawSkyBuffer();
  drawGroundBuffer();
  
  branchData = [
    { label: "Technical", angle: -PI/1.8, description: "Technical infrastructure and development capabilities" },
    { label: "Financial", angle: -PI/3, description: "Budget, funding, and financial considerations" },
    { label: "Marketing", angle: -PI/6, description: "Promotion and customer acquisition strategies" },
    { label: "Compliance", angle: PI/6, description: "Legal and regulatory requirements" },
    { label: "Project", angle: PI/3, description: "Management and operational aspects" },
    { label: "Canopy", angle: PI/1.8, description: "User interface and experience components" }
  ];

  tree = {
    trunk: {
      height: 0,
      maxHeight: 300,
      width: 25,
      baseWidth: 40,
      color: [80, 50, 20],
      texture: barkTexture
    },
    branches: [],
    leaves: [],
    settings: {
      growthSpeed: 2,
      swayIntensity: 0.05,
      leafDensity: 15,
      windStrength: 0,
      branchColors: [
        [90, 110, 80],
        [120, 90, 70],
        [150, 80, 80],
        [100, 80, 120],
        [80, 120, 130],
        [130, 120, 80]
      ],
      leafTypes: [0, 1, 2]
    },
    state: {
      ready: false,
      selectedBranch: null,
      hoveredBranch: null,
      tooltip: null,
      windDirection: 1
    }
  };

  tree.state.tooltip = createDiv('');
  tree.state.tooltip.class('branch-tooltip');
  tree.state.tooltip.hide();
}

function drawSkyBuffer() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(135, 206, 250), color(240, 248, 255), inter);
    skyBuffer.stroke(c);
    skyBuffer.line(0, y, width, y);
  }
  
  skyBuffer.noStroke();
  skyBuffer.fill(255, 255, 255, 100);
  for (let i = 0; i < 5; i++) {
    let x = i * 200 % (width + 200) - 100;
    let y = 50 + noise(i * 10) * 50;
    skyBuffer.ellipse(x, y, 100, 40);
    skyBuffer.ellipse(x + 30, y - 10, 80, 40);
    skyBuffer.ellipse(x - 20, y + 10, 60, 30);
  }
}

function drawGroundBuffer() {
  groundBuffer.noStroke();
  groundBuffer.fill(34, 139, 34);
  groundBuffer.rect(0, height - 50, width, 50);
  
  groundBuffer.fill(139, 69, 19);
  for (let x = 0; x < width; x += 20) {
    groundBuffer.beginShape();
    groundBuffer.vertex(x, height - 50);
    groundBuffer.vertex(x + 20, height - 50);
    groundBuffer.vertex(x + 20, height - 40 + noise(x * 0.1) * 10);
    groundBuffer.vertex(x, height - 40 + noise(x * 0.1 + 10) * 10);
    groundBuffer.endShape(CLOSE);
  }
  
  groundBuffer.stroke(50, 120, 50);
  groundBuffer.strokeWeight(1);
  for (let x = 0; x < width; x += 5) {
    let h = noise(x * 0.1) * 15;
    groundBuffer.line(x, height - 50, x + random(-3, 3), height - 50 - h);
  }
}

function draw() {
  image(skyBuffer, 0, 0);
  image(groundBuffer, 0, 0);
  drawTree();
  updateInfoPanel();
}

function drawTree() {
  push();
  translate(width / 2, height);
  
  if (tree.trunk.height < tree.trunk.maxHeight) {
    tree.trunk.height += tree.settings.growthSpeed;
  }
  
  drawTrunk();
  
  if (tree.trunk.height >= tree.trunk.maxHeight && !tree.state.ready) {
    createBranches();
    tree.state.ready = true;
  }

  if (tree.state.ready) {
    updateBranches();
    drawBranches();
    drawLeaves();
    updateTooltip();
  }
  
  pop();
}

function drawTrunk() {
  let segments = 30;
  for (let i = 0; i < segments; i++) {
    let y1 = map(i, 0, segments, 0, -tree.trunk.height);
    let y2 = map(i + 1, 0, segments, 0, -tree.trunk.height);
    
    let w1 = map(i, 0, segments, tree.trunk.baseWidth, tree.trunk.width);
    let w2 = map(i + 1, 0, segments, tree.trunk.baseWidth, tree.trunk.width);
    
    let xOffset1 = sin(y1 * 0.05 + frameCount * 0.02) * 5;
    let xOffset2 = sin(y2 * 0.05 + frameCount * 0.02) * 5;
    
    noStroke();
    fill(80, 50, 20);
    beginShape();
    vertex(-w1/2 + xOffset1, y1);
    vertex(w1/2 + xOffset1, y1);
    vertex(w2/2 + xOffset2, y2);
    vertex(-w2/2 + xOffset2, y2);
    endShape(CLOSE);
    
    for (let x = -w1/2 + xOffset1; x < w1/2 + xOffset1; x += 2) {
      for (let y = y1; y < y2; y += 2) {
        let n = noise(x * 0.1, y * 0.1);
        let c = n * 50;
        stroke(80 + c, 50 + c * 0.5, 20 + c * 0.2, 100);
        point(x, y);
      }
    }
    
    stroke(40, 25, 10);
    strokeWeight(1);
    if (i % 5 === 0) {
      line(-w1/2 + xOffset1 - 2, y1, w1/2 + xOffset1 + 2, y1);
    }
  }
}

function createBranches() {
  for (let i = 0; i < branchData.length; i++) {
    let len = random(80, 120);
    let branch = {
      ...branchData[i],
      length: 0,
      currentLength: 0,
      maxLength: len,
      color: tree.settings.branchColors[i],
      hover: false,
      currentAngle: branchData[i].angle,
      targetAngle: branchData[i].angle,
      targetLength: len,
      subBranches: [],
      clickBox: { x: 0, y: 0, w: 70, h: 25 }
    };

    let subBranchCount = floor(random(2, 5));
    for (let j = 0; j < subBranchCount; j++) {
      let subLen = len * random(0.4, 0.7);
      let subAngle = branch.angle + random(-PI/4, PI/4);
      if (branch.angle < 0) {
        subAngle = constrain(subAngle, -PI/2, 0);
      } else {
        subAngle = constrain(subAngle, 0, PI/2);
      }
      
      branch.subBranches.push({
        length: 0,
        maxLength: subLen,
        angle: subAngle,
        currentAngle: branch.angle,
        targetAngle: subAngle,
        offset: random(0.3, 0.9),
        width: random(2, 4)
      });
    }
    tree.branches.push(branch);
  }
}

function updateBranches() {
  tree.settings.windStrength = map(mouseX, 0, width, -0.15, 0.15);
  tree.state.windDirection = sin(frameCount * 0.01) > 0 ? 1 : -1;
  
  for (let i = 0; i < tree.branches.length; i++) {
    let b = tree.branches[i];
    
    if (b.currentLength < b.maxLength) {
      b.currentLength = lerp(b.currentLength, b.maxLength, 0.08);
      if (b.currentLength > b.maxLength * 0.7 && 
          tree.leaves.filter(l => l.branch === i).length < tree.settings.leafDensity) {
        createLeaves(i);
      }
    }

    let windEffect = tree.settings.windStrength * tree.state.windDirection;
    
    if (tree.state.selectedBranch === null) {
      b.currentAngle = lerp(b.currentAngle, 
                           b.targetAngle + 
                           sin(frameCount * 0.05 + i) * tree.settings.swayIntensity + 
                           windEffect, 
                           0.1);
    } else if (tree.state.selectedBranch === i) {
      b.currentAngle = lerp(b.currentAngle, 
                           b.targetAngle + 
                           sin(frameCount * 0.2) * 0.3 + 
                           windEffect, 
                           0.05);
    } else {
      b.currentAngle = lerp(b.currentAngle, 
                           b.targetAngle + 
                           windEffect, 
                           0.1);
    }

    for (let sub of b.subBranches) {
      sub.currentAngle = lerp(sub.currentAngle, 
                             sub.targetAngle + 
                             sin(frameCount * 0.05 + i) * tree.settings.swayIntensity * 0.7 + 
                             windEffect * 0.7, 
                             0.1);
      if (sub.length < sub.maxLength) {
        sub.length = lerp(sub.length, sub.maxLength, 0.08);
      }
    }

    let endX = sin(b.currentAngle) * b.currentLength;
    let endY = -tree.trunk.height + cos(b.currentAngle) * b.currentLength;
    b.clickBox.x = width / 2 + endX - b.clickBox.w / 2;
    b.clickBox.y = height + endY - b.clickBox.h / 2;
  }
}

function drawBranches() {
  for (let i = 0; i < tree.branches.length; i++) {
    let b = tree.branches[i];
    
    push();
    translate(0, -tree.trunk.height);
    rotate(b.currentAngle);
    
    stroke(40, 30, 20, 50);
    strokeWeight(5);
    line(0, 0, b.currentLength, 0);
    
    if (tree.state.hoveredBranch === i || tree.state.selectedBranch === i) {
      stroke(red(b.color) * 0.7, green(b.color) * 0.7, blue(b.color) * 0.7);
      strokeWeight(5);
    } else {
      stroke(b.color);
      strokeWeight(4);
    }
    line(0, 0, b.currentLength, 0);
    
    for (let sub of b.subBranches) {
      push();
      translate(b.currentLength * sub.offset, 0);
      rotate(sub.currentAngle - b.currentAngle);
      
      stroke(40, 30, 20, 50);
      strokeWeight(sub.width + 1);
      line(0, 0, sub.length, 0);
      
      stroke(red(b.color) * 0.9, green(b.color) * 0.9, blue(b.color) * 0.9);
      strokeWeight(sub.width);
      line(0, 0, sub.length, 0);
      
      pop();
    }
    
    pop();

    drawBranchLabel(b);
  }
}

function drawBranchLabel(b) {
  push();
  fill(50, 50, 50, 220);
  stroke(100, 100, 100, 100);
  strokeWeight(1);
  rect(b.clickBox.x, b.clickBox.y, b.clickBox.w, b.clickBox.h, 5);
  
  noStroke();
  fill(240, 240, 240);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(b.label, b.clickBox.x + b.clickBox.w / 2, b.clickBox.y + b.clickBox.h / 2);
  pop();
}

function createLeaves(branchIndex) {
  let b = tree.branches[branchIndex];
  let clusterSize = floor(random(8, 15));
  
  for (let i = 0; i < clusterSize; i++) {
    let angle = b.currentAngle;
    let t = random(0.6, 1.0);
    let baseX = cos(angle) * b.currentLength * t;
    let baseY = -tree.trunk.height + sin(angle) * b.currentLength * t;
    
    let distFromBranch = random(5, 20);
    let angleOffset = random(-PI/4, PI/4);
    
    tree.leaves.push({
      x: width/2 + baseX + cos(angle + angleOffset) * distFromBranch,
      y: height + baseY + sin(angle + angleOffset) * distFromBranch,
      size: random(10, 20),
      type: floor(random(tree.settings.leafTypes.length)),
      color: color(
        random(80, 150),
        random(120, 180),
        random(60, 120),
        random(180, 220)
      ),
      sway: random(0, TWO_PI),
      rotation: random(0, TWO_PI),
      rotationSpeed: random(-0.03, 0.03),
      branch: branchIndex,
      age: 0,
      maxAge: random(200, 300),
      falling: false,
      fallSpeed: 0,
      windEffect: random(0.8, 1.2)
    });
  }
}

function drawLeaves() {
  for (let i = tree.leaves.length - 1; i >= 0; i--) {
    let leaf = tree.leaves[i];
    leaf.age++;
    
    if (leaf.age > leaf.maxAge && !leaf.falling) {
      leaf.falling = true;
      leaf.fallSpeed = random(0.5, 2);
    }
    
    if (leaf.falling) {
      leaf.y += leaf.fallSpeed;
      leaf.x += sin(frameCount * 0.1 + leaf.sway) * 2 * leaf.windEffect;
      if (leaf.y > height + 50) {
        tree.leaves.splice(i, 1);
        continue;
      }
    }
    
    let swayOffset = leaf.falling ? 0 : 
      sin(frameCount * 0.1 * leaf.windEffect + leaf.sway) * 5;
    leaf.rotation += leaf.rotationSpeed * leaf.windEffect;
    
    push();
    translate(leaf.x + swayOffset, leaf.y);
    rotate(leaf.rotation);
    
    let alpha = 200;
    if (leaf.age < 30) alpha = map(leaf.age, 0, 30, 0, 200);
    if (leaf.age > leaf.maxAge - 30) alpha = map(leaf.age, leaf.maxAge - 30, leaf.maxAge, 200, 0);
    
    tint(red(leaf.color), green(leaf.color), blue(leaf.color), alpha);
    imageMode(CENTER);
    image(leafImages[leaf.type], 0, 0, leaf.size, leaf.size * 0.8);
    
    pop();
  }
}

function mousePressed() {
  let clickedBranch = checkBranchClick(mouseX, mouseY);
  
  if (clickedBranch !== null) {
    if (branchData[clickedBranch].label === "Canopy") {
      // Use an absolute path for redirection
      const path = window.location.pathname;
      const base = path.substring(0, path.lastIndexOf('/') + 1);
      window.location.href = base + '../branches/canopy/frontend/Canopy.html';
      return;
    } else {
      tree.state.selectedBranch = clickedBranch;
      updateBranchInfo(clickedBranch);
      
      tree.branches[clickedBranch].targetAngle += random(-0.2, 0.2);
      tree.branches[clickedBranch].targetLength *= random(0.9, 1.1);
      
      createLeaves(clickedBranch);
      for (let i = 0; i < 3; i++) {
        let leaf = random(tree.leaves.filter(l => l.branch === clickedBranch));
        if (leaf && !leaf.falling) {
          leaf.falling = true;
          leaf.fallSpeed = random(1, 2);
        }
      }
    }
  } else {
    tree.state.selectedBranch = null;
    document.getElementById('branch-info').textContent = "Click on any branch to see details";
  }
}

function updateBranchInfo(branchIndex) {
  let b = tree.branches[branchIndex];
  document.getElementById('branch-info').innerHTML = `
    <h2>${b.label}</h2>
    <p>${b.description}</p>
    <div class="branch-stats">
      <span>Length: ${floor(b.currentLength)}px</span>
      <span>Angle: ${floor(degrees(b.currentAngle))}°</span>
    </div>
  `;
}

function mouseMoved() {
  let foundHover = false;
  
  for (let i = 0; i < tree.branches.length; i++) {
    let b = tree.branches[i];
    let box = b.clickBox;
    let inBox = mouseX >= box.x && mouseX <= box.x + box.w && 
                mouseY >= box.y && mouseY <= box.y + box.h;
    
    tree.branches[i].hover = inBox;
    if (inBox) {
      tree.state.hoveredBranch = i;
      foundHover = true;
    }
  }
  
  if (!foundHover) {
    tree.state.hoveredBranch = null;
  }
}

function updateTooltip() {
  if (tree.state.hoveredBranch !== null) {
    let b = tree.branches[tree.state.hoveredBranch];
    tree.state.tooltip.html(`<strong>${b.label}</strong>`);
    tree.state.tooltip.position(b.clickBox.x + b.clickBox.w/2, b.clickBox.y - 30);
    tree.state.tooltip.show();
    cursor('pointer');
  } else {
    tree.state.tooltip.hide();
    cursor('default');
  }
}

function checkBranchClick(x, y) {
  for (let i = 0; i < tree.branches.length; i++) {
    let b = tree.branches[i];
    let box = b.clickBox;
    if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
      return i;
    }
  }
  return null;
}

function mouseReleased() {
  if (tree.state.selectedBranch !== null) {
    tree.branches[tree.state.selectedBranch].targetAngle = branchData[tree.state.selectedBranch].angle;
    tree.branches[tree.state.selectedBranch].targetLength = tree.branches[tree.state.selectedBranch].maxLength;
  }
  tree.state.selectedBranch = null;
}

function updateInfoPanel() {
  // Placeholder for dynamic updates if needed
}
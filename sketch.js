let baseIterations = 1000;
let maxIterations = 1000;
let W = 800;
let H;

let xmin = -2.5;
let xmax = 1;
let ymin = -1;
let ymax = 1;

let zoomProgress = 0;
let txmin, txmax, tymin, tymax;
let animating = false;

let mshader;
let zoomLevel = 1;
let initialViewportWidth = 3.5;

let isDragging = false;
let lastMouseX, lastMouseY;
let dragStartX, dragStartY;

let touches = [];
let lastTouchDistance = 0;
let touchDragging = false;
let lastTouchX, lastTouchY;
let updateZoomTitle = true;

function preload() {
  mshader = loadShader("vert.vs", "mandlebrot.frag");
}

function resetCenter() {
  txmin = -2.5;
  txmax = 1;
  tymin = -1;
  tymax = 1;

  zoomProgress = 0;
  animating = true;

  maxIterations = baseIterations;

  let zoomDisplay = select("#zoom-display");
  if (zoomDisplay) {
    zoomDisplay.removeClass("warning");
    zoomDisplay.removeClass("max-zoom");
  }

  loop();
}

function setup() {
  let availableHeight = window.innerHeight;
  if (window.innerWidth <= 768) {
    availableHeight = window.innerHeight - 200;
  }

  W = windowWidth;
  H = min((W / 3) * 2, availableHeight);

  createCanvas(W, H, WEBGL);
  noStroke();
  pixelDensity(1);
  noLoop();

  createControlPanel();

  let zoomDisplay = createDiv("Zoom: 1x | Iterations: 1000");
  zoomDisplay.id("zoom-display");
  zoomDisplay.class("info-display");

  let controlsInfo = createDiv(
    "Desktop: Scroll=Zoom | Drag=Pan | +/-=Iterations | Mobile: Pinch=Zoom | Touch=Pan"
  );
  controlsInfo.class("controls-info");

  setupPanAndZoomListeners();
}

function setupPanAndZoomListeners() {
  let canvas = document.querySelector("canvas");
  if (!canvas) return;

  canvas.ontouchstart = null;
  canvas.ontouchmove = null;
  canvas.ontouchend = null;

  let touches = [];
  let lastDistance = 0;
  let isDragging = false;
  let lastX = 0,
    lastY = 0;
  let isZooming = false;

  canvas.ontouchstart = function (e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    if (touches.length === 1) {
      isDragging = true;
      isZooming = false;
      lastX = touches[0].clientX;
      lastY = touches[0].clientY;
    } else if (touches.length === 2) {
      isDragging = false;
      isZooming = true;
      let dx = touches[0].clientX - touches[1].clientX;
      let dy = touches[0].clientY - touches[1].clientY;
      lastDistance = Math.sqrt(dx * dx + dy * dy);
    }
  };

  canvas.ontouchmove = function (e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    if (touches.length === 1 && isDragging && !isZooming) {
      let deltaX = touches[0].clientX - lastX;
      let deltaY = touches[0].clientY - lastY;
      panFractal(deltaX, deltaY);
      lastX = touches[0].clientX;
      lastY = touches[0].clientY;
    } else if (touches.length === 2 && isZooming) {
      let dx = touches[0].clientX - touches[1].clientX;
      let dy = touches[0].clientY - touches[1].clientY;
      let currentDistance = Math.sqrt(dx * dx + dy * dy);
      if (lastDistance > 20) {
        let zoomFactor = currentDistance / lastDistance;
        zoomFactor = Math.max(0.5, Math.min(zoomFactor, 2.0));
        let centerX = (touches[0].clientX + touches[1].clientX) / 2;
        let centerY = (touches[0].clientY + touches[1].clientY) / 2;
        let rect = canvas.getBoundingClientRect();
        centerX -= rect.left;
        centerY -= rect.top;
        zoomAt(centerX, centerY, zoomFactor);
        lastDistance = currentDistance;
      }
    }
  };

  canvas.ontouchend = function (e) {
    e.preventDefault();
    if (e.touches.length === 0) {
      isDragging = false;
      isZooming = false;
      lastDistance = 0;
      touches = [];
    } else if (e.touches.length === 1) {
      isZooming = false;
      isDragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      lastDistance = 0;
    }
  };
}

function panFractal(deltaX, deltaY) {
  let viewWidth = xmax - xmin;
  let viewHeight = ymax - ymin;
  let complexDeltaX = -(deltaX / W) * viewWidth;
  let complexDeltaY = (deltaY / H) * viewHeight;
  xmin += complexDeltaX;
  xmax += complexDeltaX;
  ymin += complexDeltaY;
  ymax += complexDeltaY;
  redraw();
}

function createControlPanel() {
  let controlPanel = createDiv("");
  controlPanel.class("control-panel");

  let resetBtn = createButton("⟲");
  resetBtn.class("btn btn-reset");
  resetBtn.attribute("title", "Reset View");
  resetBtn.parent(controlPanel);
  resetBtn.mousePressed(resetCenter);
  resetBtn.touchStarted(resetCenter);

  let zoomInBtn = createButton("⊕");
  zoomInBtn.class("btn btn-zoom-in");
  zoomInBtn.attribute("title", "Zoom In");
  zoomInBtn.parent(controlPanel);
  zoomInBtn.mousePressed(() => zoomAtCenter(2));
  zoomInBtn.touchStarted(() => zoomAtCenter(2));

  let zoomOutBtn = createButton("⊖");
  zoomOutBtn.class("btn btn-zoom-out");
  zoomOutBtn.attribute("title", "Zoom Out");
  zoomOutBtn.parent(controlPanel);
  zoomOutBtn.mousePressed(() => zoomAtCenter(0.5));
  zoomOutBtn.touchStarted(() => zoomAtCenter(0.5));

  let saveBtn = createButton("💾");
  saveBtn.class("btn btn-save");
  saveBtn.attribute("title", "Save Image");
  saveBtn.parent(controlPanel);
  let saveFunction = () => {
    let currentZoomLevel = initialViewportWidth / (xmax - xmin);
    save(`mandelbrot-zoom-${Math.floor(currentZoomLevel)}.png`);
  };
  saveBtn.mousePressed(saveFunction);
  saveBtn.touchStarted(saveFunction);

  setTimeout(() => {
    let buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      btn.style.cursor = "pointer";

      btn.addEventListener(
        "touchstart",
        (e) => {
          e.stopPropagation();
          btn.style.transform = "scale(0.95)";
        },
        { passive: true }
      );

      btn.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          btn.style.transform = "scale(1)";

          setTimeout(() => {
            btn.click();
          }, 50);
        },
        { passive: false }
      );

      btn.addEventListener(
        "touchcancel",
        (e) => {
          btn.style.transform = "scale(1)";
        },
        { passive: true }
      );
    });
  }, 200);
}

function windowResized() {
  let availableHeight = window.innerHeight;
  if (window.innerWidth <= 768) {
    availableHeight = window.innerHeight - 200;
  }

  W = windowWidth;
  H = min((W / 3) * 2, availableHeight);
  resizeCanvas(W, H);
  redraw();

  setupPanAndZoomListeners();
}

function zoomAtCenter(zoomFactor) {
  zoomAt(W / 2, H / 2, zoomFactor);
}

function mousePressed() {
  if (mouseX < 0 || mouseX > W || mouseY < 0 || mouseY > H) return;

  isDragging = true;
  dragStartX = mouseX;
  dragStartY = mouseY;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseDragged() {
  if (!isDragging) return;
  if (mouseX < 0 || mouseX > W || mouseY < 0 || mouseY > H) return;
  panFractal(mouseX - lastMouseX, mouseY - lastMouseY);
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseReleased() {
  isDragging = false;
}

function touchStarted() {
  if (!touches || touches.length === 0) return true;

  let touch = touches[0];
  let canvasRect = document.querySelector("canvas").getBoundingClientRect();
  let touchX = touch.x;
  let touchY = touch.y;

  if (
    touchX < 0 ||
    touchX > canvasRect.width ||
    touchY < 0 ||
    touchY > canvasRect.height
  ) {
    return true;
  }

  if (touches.length === 1) {
    touchDragging = true;
    lastTouchX = touchX;
    lastTouchY = touchY;
  } else if (touches.length === 2) {
    touchDragging = false;
    let touch1 = touches[0];
    let touch2 = touches[1];
    lastTouchDistance = dist(touch1.x, touch1.y, touch2.x, touch2.y);
  }

  return false;
}

function touchMoved() {
  if (!touches || touches.length === 0) return true;

  let touch = touches[0];
  let canvasRect = document.querySelector("canvas").getBoundingClientRect();
  let touchX = touch.x;
  let touchY = touch.y;

  if (
    touchX < 0 ||
    touchX > canvasRect.width ||
    touchY < 0 ||
    touchY > canvasRect.height
  ) {
    return true;
  }

  if (touches.length === 1 && touchDragging) {
    let deltaX = touchX - lastTouchX;
    let deltaY = touchY - lastTouchY;

    panFractal(deltaX, deltaY);

    lastTouchX = touchX;
    lastTouchY = touchY;

    redraw();
  } else if (touches.length === 2) {
    let touch1 = touches[0];
    let touch2 = touches[1];
    let currentDistance = dist(touch1.x, touch1.y, touch2.x, touch2.y);

    if (lastTouchDistance > 0) {
      let zoomFactor = currentDistance / lastTouchDistance;

      zoomFactor = constrain(zoomFactor, 0.8, 1.25);

      let centerX = (touch1.x + touch2.x) / 2;
      let centerY = (touch1.y + touch2.y) / 2;

      zoomAt(centerX, centerY, zoomFactor);
    }

    lastTouchDistance = currentDistance;
  }

  return false;
}
function touchEnded() {
  touchDragging = false;
  lastTouchDistance = 0;

  return true;
}

function mouseWheel(event) {
  if (mouseX < 0 || mouseX > W || mouseY < 0 || mouseY > H) return;

  event.preventDefault();

  let zoomFactor = event.delta > 0 ? 0.7 : 1.4;

  zoomAt(mouseX, mouseY, zoomFactor);

  return false;
}

function keyPressed() {
  if (key === "+" || key === "=") {
    baseIterations = Math.min(baseIterations * 1.5, 10000);
  } else if (key === "-") {
    baseIterations = Math.max(baseIterations / 1.5, 100);
  } else if (key === "s" || key === "S") {
    save(`mandelbrot-zoom-${Math.floor((xmax - xmin) * 1e12)}.png`);
  }

  if (key === "+" || key === "=" || key === "-") {
    redraw();
  }
}

function draw() {
  if (animating) {
    zoomProgress += 0.005;
    if (zoomProgress >= 1) {
      zoomProgress = 1;
      animating = false;
      noLoop();
    }

    xmin = lerp(xmin, txmin, zoomProgress);
    xmax = lerp(xmax, txmax, zoomProgress);
    ymin = lerp(ymin, tymin, zoomProgress);
    ymax = lerp(ymax, tymax, zoomProgress);
  }

  let currentViewportWidth = xmax - xmin;
  let currentZoomLevel = initialViewportWidth / currentViewportWidth;

  if (currentZoomLevel > 500000) {
    let zoomDisplay = select("#zoom-display");
    if (zoomDisplay) {
      zoomDisplay.html("🚫 MAX ZOOM REACHED (500K) - Cannot zoom further! 🚫");
      zoomDisplay.removeClass("warning");
      zoomDisplay.addClass("max-zoom");
    }
    return;
  }

  if (currentZoomLevel > 250000) {
    maxIterations = Math.floor(baseIterations * 20);
    maxIterations = Math.min(maxIterations, 20000);
  } else if (currentZoomLevel > 50000) {
    maxIterations = Math.floor(
      baseIterations * (8 + Math.log10(currentZoomLevel / 50000) * 6)
    );
    maxIterations = Math.min(maxIterations, 15000);
  } else if (currentZoomLevel > 10000) {
    maxIterations = Math.floor(
      baseIterations * (3 + Math.log10(currentZoomLevel / 10000) * 3)
    );
    maxIterations = Math.min(maxIterations, 8000);
  } else if (currentZoomLevel > 1000) {
    maxIterations = Math.floor(
      baseIterations * (1.5 + Math.log10(currentZoomLevel / 1000) * 1.5)
    );
    maxIterations = Math.min(maxIterations, 4000);
  } else {
    maxIterations = Math.floor(
      baseIterations * (1 + Math.log10(currentZoomLevel) * 0.3)
    );
    maxIterations = Math.min(maxIterations, 2000);
  }

  let zoomDisplay = select("#zoom-display");
  if (zoomDisplay) {
    let zoomStr =
      currentZoomLevel > 1000000
        ? `${(currentZoomLevel / 1000000).toFixed(1)}M`
        : currentZoomLevel > 1000
        ? `${(currentZoomLevel / 1000).toFixed(1)}K`
        : `${currentZoomLevel.toFixed(1)}`;

    if (updateZoomTitle) {
      if (currentZoomLevel > 400000) {
        zoomDisplay.html(
          `Zoom: ${zoomStr}x | Iterations: ${maxIterations} | ⚠️ APPROACHING MAX ZOOM (500K)`
        );
        zoomDisplay.removeClass("max-zoom");
        zoomDisplay.addClass("warning");
      } else {
        zoomDisplay.html(
          `Zoom: ${zoomStr}x | Iterations: ${maxIterations} | Width: ${currentViewportWidth.toExponential(
            2
          )}`
        );
        zoomDisplay.removeClass("warning");
        zoomDisplay.removeClass("max-zoom");
      }
    }
  }

  shader(mshader);

  mshader.setUniform("xmin", xmin);
  mshader.setUniform("xmax", xmax);
  mshader.setUniform("ymin", ymin);
  mshader.setUniform("ymax", ymax);
  mshader.setUniform("maxIterations", maxIterations);
  mshader.setUniform("resolution", [W * zoomLevel, H * zoomLevel]);

  drawFullscreenQuad();
}

function drawFullscreenQuad() {
  beginShape();
  vertex(-1, -1, 0);
  vertex(1, -1, 0);
  vertex(1, 1, 0);
  vertex(-1, 1, 0);
  endShape(CLOSE);
}

function zoomAt(targetX, targetY, zoomFactor) {
  let currentViewportWidth = xmax - xmin;
  let newViewportWidth = currentViewportWidth / zoomFactor;
  let newZoomLevel = initialViewportWidth / newViewportWidth;

  if (newZoomLevel > 500000) {
    let zoomDisplay = select("#zoom-display");
    if (zoomDisplay) {
      zoomDisplay.html("🚫 MAX ZOOM REACHED (500K) - Cannot zoom further! 🚫");
      zoomDisplay.removeClass("warning");
      zoomDisplay.addClass("max-zoom");
    }
    updateZoomTitle = false;
    return;
  } else {
    updateZoomTitle = true;
  }

  let cx = map(targetX, 0, W, xmin, xmax);
  let cy = map(H - targetY, 0, H, ymin, ymax);

  let newW = (xmax - xmin) / zoomFactor;
  let newH = (ymax - ymin) / zoomFactor;

  txmin = cx - newW / 2;
  txmax = cx + newW / 2;
  tymin = cy - newH / 2;
  tymax = cy + newH / 2;

  zoomProgress = 0;
  animating = true;

  loop();
}

var ELECTRODE_SIZE = 40;

var HIGH = "rgb(255, 0, 0)"; // red
var LOW = "rgb(0, 255, 255)"; // light blue
var DONTCARE = "rgb(255, 255, 255)"; // white
var NOPIN = "rgb(0, 0, 0)"; // black

///////////////////////////////////////////////////////////////////////////
// POINT class
function Point(x, y) {
  this.mX = x;
  this.mY = y;
  this.set = set;
  this.getX = getX;
  this.getY = getY;
}

function set(x, y) {
  this.mX = x;
  this.mY = y;
}

function getX() {
  return this.mX;
}

function getY() {
  return this.mY;
}

///////////////////////////////////////////////////////////////////////////
// PIN class
function Pin(x, y, ActuationSequence) {
  this.mP = new Point(x, y);
  this.mActuation = ActuationSequence;
  this.getStateAtTime = getStateAtTime;
  this.set = set;
  this.getP = getP;
}

function getP() {
  return this.mP;
}

function getStateAtTime(t) {
  return this.mActuation[t];
}

///////////////////////////////////////////////////////////////////////////
// ELECTRODE class
function Electrode(_x, _y, state) {
  this.mRect = new Kinetic.Rect({
    x: _x,
    y: _y,
    width: ELECTRODE_SIZE,
    height: ELECTRODE_SIZE,
    stroke: "black",
    strokeWidth: 1,
    fill: state
  });
  this.getState = getState;
}

function getState() {
  return this.mRect.getFill();
}

///////////////////////////////////////////////////////////////////////////
// DROPLET class
function Droplet() {
  this.mP = new Point(0, 0);
  this.mR = Math.floor(Math.random() * 1000000) % 256;
  this.mG = 128 + Math.floor(Math.random() * 1000000) % 256;
  this.mB = Math.floor(Math.random() * 1000000) % 256;
  this.mCircle = new Kinetic.Circle({
    radius: ELECTRODE_SIZE / 3,
    stroke: "black",
    strokeWidth: 1,
    opacity: 0.6,
    shadow: {
      color: "black",
      blur: 10,
      offset: [5, 5],
      opacity: 0.8
    },
    fill: "rgb(" + this.mR + ", " + this.mG + ", " + this.mB + ")",
  });
  this.getP = getP;
  this.setColor = setColor;
}

function setColor(r, g, b) {
  this.mR = r;
  this.mG = g;
  this.mB = b;
}
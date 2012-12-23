///////////////////////////////////////////////////////////////////////////
// CHIP class
function Chip() {
  this.mWidth = 0;
  this.mHeight = 0;
  this.mTimeSteps = 0;
  this.mPin = new Array();
  this.mElectrode = new Array();
    
  this.setWidth = setWidth;
  this.setHeight = setHeight;
  this.setTimeSteps = setTimeSteps;

  this.addNewPin = addNewPin;
  this.addNewElectrode = addNewElectrode;

  this.getNumOfPin = getNumOfPin;
  this.getNumOfElectrode = getNumOfElectrode;
  this.getPin = getPin;
  this.getElectrode = getElectrode;
  this.getTimeSteps = getTimeSteps;
  this.getWidth = getWidth;
  this.getHeight = getHeight;

  this.changeElectrode = changeElectrode;
}

function setWidth(width) {
  this.mWidth = width;
}

function setHeight(height) {
  this.mHeight = height;
}

function setTimeSteps(TimeSteps) {
  this.mTimeSteps = TimeSteps;
}

function getWidth() {
  return this.mWidth;
}

function getHeight() {
  return this.mHeight;
}

function addNewPin(x, y, ActuationSequence) {
  this.mPin.push(new Pin(x, y, ActuationSequence));  
}

function addNewElectrode(x, y, state) {
  this.mElectrode.push(new Electrode(x, y, state));
}

function getNumOfPin() {
  return this.mPin.length;
}

function getNumOfElectrode() {
  return this.mElectrode.length;
}

function getPin(i) {
  return this.mPin[i];
}

function getElectrode(i) {
  return this.mElectrode[i];
}

function getTimeSteps() {
  return this.mTimeSteps;
}

function changeElectrode(i, state) {
  this.mElectrode[i].mRect.setFill(state);
}
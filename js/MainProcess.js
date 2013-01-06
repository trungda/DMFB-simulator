// a stage and a layer for drawing
var stage;
var layer;
var TopLeft;
var chip;

// a string which contains the content of file
var FileContent;

var droplets;

var dx = new Array(-1, 0, 1, 0);
var dy = new Array(0, 1, 0, -1);

var timer;
var nTimeSteps, CurrentTime;
var interval;

var ToggleButton;
var State; // 0 = paused 1 = running

function Init() {
  TopLeft = new Point(ELECTRODE_SIZE * 8, ELECTRODE_SIZE);
  chip = new Chip();
  CurrentTime = 0;
  State = 0;
}

///////////////////////////////////////////////////////////////////////////
// Process functions

// Load data of Chip from text file
function LoadChip(FileContent) {
  var ss = new StringStream(FileContent);
  chip.setHeight(ss.ssparseInt());
  chip.setWidth(ss.ssparseInt());
  var nPins = ss.ssparseInt();
  chip.setTimeSteps(ss.ssparseInt());
  if (chip.getHeight() == 0 || chip.getWidth() == 0 || nPins == 0 || chip.getTimeSteps() == 0) {
    alert("Error: Wrong file format.");
    window.location.reload();
    return;
  }
  // add electrodes 
  for (var i = 0; i < chip.getHeight(); i ++)
    for (var j = 0; j < chip.getWidth(); j ++) {
      chip.addNewElectrode(TopLeft.getX() + ELECTRODE_SIZE * j, TopLeft.getY() + ELECTRODE_SIZE * i, NOPIN);
    }

  // add pins to the list of pins
  for (var i = 0; i < nPins; i ++) {
    // coordination in web page is different from the coordination in data file
    // so it is neccesary to switch the positinon of x and y
    var x = ss.ssparseInt();
    var y = ss.ssparseInt();
    var PinID = ss.ssparseInt(); 
    var ActuationSequence = ss.ssparseString();
    for (var j = 0; j < ActuationSequence.length; j ++) 
      if (!(ActuationSequence[j] == '1' || ActuationSequence[j] != '0' || ActuationSequence[j] != 'X')) {
        alert("Error: Wrong file format.");
        window.location.reload();
        return;
      }
    chip.addNewPin(PinID, y, x, ActuationSequence);
  }
}

// Draw foundation of a chip
// Add numbers around the chip and a timer
function AddBoundary() {
  for (var i = 0; i < chip.getWidth(); i ++) {
    var simpleText = new Kinetic.Text({
      x: TopLeft.getX() + i * ELECTRODE_SIZE + 10,
      y: 10,
      text: i.toString(),
      fontSize: 18,
      textFill: "black",
      align: "center",
    });
    layer.add(simpleText);
  }
  for (var i = 0; i < chip.getHeight(); i ++) {
    var simpleText = new Kinetic.Text({
      x: TopLeft.getX() - ELECTRODE_SIZE,
      y: TopLeft.getY() + i * ELECTRODE_SIZE + 10,
      text: i.toString(),
      fontSize: 18,
      textFill: "black",
      align: "left",
    });
    layer.add(simpleText);
  }
  var label = new Kinetic.Text({
    x: 50,
    y: 70,
    textFill: "black",
    fontSize: 20,
    fontFamily: "Arial",
    text: "Current Time",
  });
  layer.add(label);
  timer = new Kinetic.Text({
    x: 50,
    y: 100,
    stroke: '#555',
    fill: "black",
    text: "0",
    fontSize: 80,
    fontFamily: "DS-Digital",
    textFill: "white",
    width: 150,
    height: 100,
    align: "center",
  });
  layer.add(timer);
}

// Draw the foundation of the chip
function Draw() {
  stage = new Kinetic.Stage({
    container: "chip",
    width: chip.getWidth() * 2 * ELECTRODE_SIZE,
    height: chip.getHeight() * 2 * ELECTRODE_SIZE,
  });
  layer = new Kinetic.Layer();
  // add boundary
  AddBoundary();
  // add electrodes to layer
  for (var i = 0; i < chip.getNumOfElectrode(); i ++) {
    layer.add(chip.mElectrode[i].mRect);
  }
  // add pin id to layer
  for (var i = 0; i < chip.getNumOfPin(); i ++) {
    var xx = chip.getPin(i).getP().getX();
    var yy = chip.getPin(i).getP().getY();
    var PinIDText = new Kinetic.Text({
      text: chip.getPin(i).getPinID().toString(),
      fontSize: 13,
      textFill: "black",
      align: "center",
    });
    var w = PinIDText.getWidth() / 2;
    var h = PinIDText.getHeight() / 2;
    PinIDText.setX(TopLeft.getX() + xx * ELECTRODE_SIZE + ELECTRODE_SIZE / 2 - w);
    PinIDText.setY(TopLeft.getY() + yy * ELECTRODE_SIZE + ELECTRODE_SIZE / 2 - h);
    layer.add(PinIDText);
  }
  // add the layer to the stage
  stage.add(layer);
}

function MoveToNextTime() {
  timer.setText("" + CurrentTime + "");
  for (var i = 0; i < chip.getNumOfPin(); i ++) {
    var x = chip.getPin(i).getP().getX();
    var y = chip.getPin(i).getP().getY();
    var index = y * chip.getWidth() + x;
    var state;
    if (chip.getPin(i).getStateAtTime(CurrentTime) == '1') {
      state = HIGH;
    }
    else if (chip.getPin(i).getStateAtTime(CurrentTime) == '0') {
      state = LOW;
    }
    else {
      state = DONTCARE;
    }
    chip.mElectrode[index].mRect.setFill(state);
  }
  
  for (var i = 0; i < droplets.length; i ++) {
    var x = droplets[i].getP().getX();
    var y = droplets[i].getP().getY();
    for (var k = 0; k < 4; k ++) {
      var xx = x + dx[k];
      var yy = y + dy[k];
      var index = yy * chip.getWidth() + xx;
      if (0 <= xx && xx < chip.getWidth() && 0 <= yy && yy < chip.getHeight()) {
        if (chip.getElectrode(index).getState() == HIGH) {
          droplets[i].mP.set(xx, yy);
          droplets[i].mCircle.transitionTo({
            x: TopLeft.getX() + xx * ELECTRODE_SIZE + ELECTRODE_SIZE / 2,
            y: TopLeft.getY() + yy * ELECTRODE_SIZE + ELECTRODE_SIZE / 2,
            duration: 1,
          });
          break;
        }
      }
    }
  }
  CurrentTime ++;
  if (CurrentTime >= nTimeSteps) {
    clearInterval(interval);
    State = 0;
  }
}

// Check whether a cell is on boundary of the chip or not
function isBoundary(x, y) {
  if (x == 0 || y == 0) return true;
  if (x == chip.getWidth() - 1 || y == chip.getHeight() - 1) return true;
  return false;
}

function Run() {
  nTimeSteps = chip.getTimeSteps();
  droplets = new Array();
  for (var i = 0; i < chip.getNumOfPin(); i ++) {
    var x = chip.getPin(i).getP().getX();
    var y = chip.getPin(i).getP().getY();
    var index = y * chip.getWidth() + x;
//    console.log(x + " " + y);
    if (chip.getPin(i).getStateAtTime(0) == '1' && isBoundary(x, y)) {
      // new droplet appears here
      chip.changeElectrode(index, HIGH);
      var droplet = new Droplet();
      droplet.mP.set(x, y);
      droplet.mCircle.setX(TopLeft.getX() + x * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
      droplet.mCircle.setY(TopLeft.getY() + y * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
      droplets.push(droplet);
      layer.add(droplet.mCircle);
    }
    else if (chip.getPin(i).getStateAtTime(0) == '0') {
      chip.changeElectrode(index, LOW);
    }
    else {
      chip.changeElectrode(index, DONTCARE);
    }
  }
  layer.draw();
  CurrentTime = 1;
  State = 1;
  interval = setInterval(MoveToNextTime, 1500);  
}

function Toggle() {
  ToggleButton = document.getElementById("toggle");
  if (State == 1) {
    ToggleButton.innerHTML = "Resume"
    State = 0;
    clearInterval(interval);
  }
  else {
    ToggleButton.innerHTML = "Pause!!!";
    State = 1;
    interval = setInterval(MoveToNextTime, 1500);
  }
}

///////////////////////////////////////////////////////////////////////////
// READ FILE
///////////////////////////////////////////////////////////////////////////
function startRead() {
  // obtain input element through DOM   
  var file = document.getElementById("file").files[0];
  if (file) {
    getAsText(file);
  }
}

function getAsText(readFile) {
  var reader;
  try {
    reader = new FileReader();
  }
  catch(e) {
    alert("Error: seems File API is not supported on your browser");
    return;
  }  
  // Read file into memory as UTF-8      
  reader.readAsText(readFile, "UTF-8");  
  // Handle progress, success, and errors
  reader.onload = loaded;
  reader.onerror = errorHandler;
}

function loaded(evt) {
  // Obtain the read file data
  // FileContent is a string containing content of the file
  FileContent = evt.target.result;
  LoadChip(FileContent);
  Draw();
  Run();
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("Error: Cannot read this file");
  }
}

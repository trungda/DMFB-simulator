// a stage and a layer for drawing
var stage;
var BaseLayer;
var DropletLayer;
var TopLeft;
var chip;

// Interval Time
var IntervalTime = 1200;

// a string which contains the content of file
var FileContent;

var droplets;

var dx = new Array(-1, 0, 1, 0, 0);
var dy = new Array(0, 1, 0, -1, 0);

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
    var token = ss.ssparseString();
    var PinID;
    var ActuationSequence;
    if (ss.StringToInt(token) != 0) { // if the next number != 0, it is PinID
      PinID = ss.StringToInt(token);
      ActuationSequence = ss.ssparseString();
    }
    else { // otherwise, it is ActuactionSequence
      PinID = 0;
      ActuationSequence = token;
    }
    for (var j = 0; j < ActuationSequence.length; j ++) 
      if (!(ActuationSequence[j] == '1' || ActuationSequence[j] != '0' || ActuationSequence[j] != 'X')) {
        alert("Error: Wrong file format.");
        window.location.reload();
        return;
      }
    chip.addNewPin(PinID, y, x, ActuationSequence);
  }  
  // add droplets to the list of droplets
  var nDroplets = ss.ssparseInt();
  droplets = new Array();
  for (var i = 0; i < nDroplets; i ++) {
    var y = ss.ssparseInt();
    var x = ss.ssparseInt();
    var t = ss.ssparseInt();
    var droplet = new Droplet();
    droplet.AppearAt = t;
    droplet.mP.set(x, y);
    droplet.mCircle.setX(TopLeft.getX() + x * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
    droplet.mCircle.setY(TopLeft.getY() + y * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
    droplets.push(droplet);
  }
  if (nDroplets == 0) {
    for (var i = 0; i < nPins; i ++) 
      if (chip.getPin(i).getStateAtTime(0) == '1') {
	var droplet = new Droplet();
	var x = chip.getPin(i).getP().getX();
	var y = chip.getPin(i).getP().getY();
	droplet.AppearAt = 0;
	droplet.mP.set(x, y);
	droplet.mCircle.setX(TopLeft.getX() + x * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
	droplet.mCircle.setY(TopLeft.getY() + y * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
	droplets.push(droplet);
      }
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
    BaseLayer.add(simpleText);
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
    BaseLayer.add(simpleText);
  }
  var label = new Kinetic.Text({
    x: 50,
    y: 70,
    textFill: "black",
    fontSize: 20,
    fontFamily: "Arial",
    text: "Current Time",
  });
  BaseLayer.add(label);
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
  BaseLayer.add(timer);
}

// Draw the foundation of the chip
function Draw() {
  stage = new Kinetic.Stage({
    container: "chip",
    width: chip.getWidth() * 2 * ELECTRODE_SIZE,
    height: chip.getHeight() * 2 * ELECTRODE_SIZE,
  });
  BaseLayer = new Kinetic.Layer();
  stage.add(BaseLayer);
  DropletLayer = new Array();
  for (var i = 0; i < 3; i ++) {
    var newLayer = new Kinetic.Layer();
    DropletLayer.push(newLayer);    
  }
  for (var i = 0; i < 3; i ++) {
    stage.add(DropletLayer[i]);
  }
  // add boundary
  AddBoundary();
  
  // add electrodes to BaseLayer
  for (var i = 0; i < chip.getNumOfElectrode(); i ++) {
    BaseLayer.add(chip.mElectrode[i].mRect);
  }
  
  // add pin id to BaseLayer
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
    if (chip.getPin(i).getPinID() != 0) { // if PinID != 0 -> print
      BaseLayer.add(PinIDText);
    }
  }
  
  // add droplets to DropletLayer
  for (var i = 0; i < droplets.length; i ++) 
    if (droplets[i].AppearAt == 0) {
      DropletLayer[i % 3].add(droplets[i].mCircle);
    }
}

function InSide(xx, yy) {
  return (0 <= xx && xx < chip.getWidth() && 0 <= yy && yy < chip.getHeight());
}

function MoveToNextTime() {
  timer.setText("" + CurrentTime + "");
//  console.log(chip.getNumOfPin());
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
    if (CurrentTime > 0 && chip.getPin(i).getStateAtTime(CurrentTime - 1) != chip.getPin(i).getStateAtTime(CurrentTime)) {
      chip.mElectrode[index].mRect.setFill(state);
    }
  }
  
  var newDroplets = new Array();
  for (var i = 0; i < droplets.length; i ++) 
    if (droplets[i].AppearAt <= CurrentTime) {
      if (droplets[i].AppearAt == CurrentTime && CurrentTime != 0) {
	DropletLayer[i % 3].add(droplets[i].mCircle);
      }
      var x = droplets[i].getP().getX();
      var y = droplets[i].getP().getY();
      var PossibleDirection = new Array();
      for (var k = 0; k < 4; k ++) {
	var xx = x + dx[k];
	var yy = y + dy[k];
	var index = yy * chip.getWidth() + xx; // get the electrode index at (xx, yy)
	if (InSide(xx, yy) && chip.getElectrode(index).getState() == HIGH) {
	  PossibleDirection.push(k);
	}
      }
      if (PossibleDirection.length == 0) {
	PossibleDirection.push(4);
      }
      if (PossibleDirection.length <= 2) { // only one or two possible movement
	var k0 = PossibleDirection[0];
	var x0 = x + dx[k0];
	var y0 = y + dy[k0];
	var index = y0 * chip.getWidth() + x0;
	droplets[i].mP.set(x0, y0);
	droplets[i].mCircle.transitionTo({
          x: TopLeft.getX() + x0 * ELECTRODE_SIZE + ELECTRODE_SIZE / 2,
          y: TopLeft.getY() + y0 * ELECTRODE_SIZE + ELECTRODE_SIZE / 2,
          duration: 1,
	});
	if (PossibleDirection.length == 2) { // split happens here
	  var k1 = PossibleDirection[1];
	  var x1 = x + dx[k1];
	  var y1 = y + dy[k1];
	  var index = y1 * chip.getWidth() + x1;
	  var droplet = new Droplet();
	  droplet.mP.set(x1, y1);
	  droplet.mCircle.setX(TopLeft.getX() + x1 * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
	  droplet.mCircle.setY(TopLeft.getY() + y1 * ELECTRODE_SIZE + ELECTRODE_SIZE / 2);
	  newDroplets.push(droplet);
	}
      }
      else { // there are more than two possible movements
	alert("Where do I have to go ???"); 
      }
    }
  for (var i = 0; i < newDroplets.length; i ++) {
    droplets.push(newDroplets[i]);
    DropletLayer.add(droplets[droplets.length - 1].mCircle);
  }
  BaseLayer.draw();
  for (var i = 0; i < 3; i ++) {
    DropletLayer[i].draw();
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
  for (var i = 0; i < chip.getNumOfPin(); i ++) {
    var x = chip.getPin(i).getP().getX();
    var y = chip.getPin(i).getP().getY();
    var index = y * chip.getWidth() + x;
    //    console.log(x + " " + y);
    if (chip.getPin(i).getStateAtTime(0) == '1' && isBoundary(x, y)) {
      // new droplet appears here
      chip.changeElectrode(index, HIGH);
    }
    else if (chip.getPin(i).getStateAtTime(0) == '0') {
      chip.changeElectrode(index, LOW);
    }
    else {
      chip.changeElectrode(index, DONTCARE);
    }
  }
  BaseLayer.draw();
  for (var i = 0; i < 3; i ++) DropletLayer[i].draw();
  CurrentTime = 1;
  State = 1;
  interval = setInterval(MoveToNextTime, IntervalTime);
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
    interval = setInterval(MoveToNextTime, IntervalTime);
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

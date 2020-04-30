/*
	References:
	https://github.com/p5-serial/p5.serialport
	https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-input-to-the-p5-js-ide/
	https://www.youtube.com/watch?v=i6eP1Lw4gZk&t=327s
*/

let canvas;

var serial; // variable to hold an instance of the serialport library
var portName = "tempPort"; // fill in your serial port name here
var dataIn; // variable to hold the input data from Arduino

let serialOn = false;

// convert to alphabetical characters
let morseKey = {
	".-": "A",
	"-...": "B",
	"-.-.": "C",
	"-..": "D",
	".": "E",
	"..-.": "F",
	"--.": "G",
	"....": "H",
	"..": "I",
	".---": "J",
	"-.-": "K",
	".-..": "L",
	"--": "M",
	"-.": "N",
	"---": "O",
	".--.": "P",
	"--.-": "Q",
	".-.": "R",
	"...": "S",
	"-": "T",
	"..-": "U",
	"...-": "V",
	".--": "W",
	"-..-": "X",
	"-.--": "Y",
	"--..": "Z",
	".----": "1",
	"..---": "2",
	"...--": "3",
	"....-": "4",
	".....": "5",
	"-....": "6",
	"--...": "7",
	"---..": "8",
	"----.": "9",
	"-----": "0",
	".-.-.-": ".",
	"--..--": ",",
	"..--..": "?",
	"-..-.": "/",
	".--.-.": "@",
};
let alphaKey = {
	A: ".-",
	B: "-...",
	C: "-.-.",
	D: "-..",
	E: ".",
	F: "..-.",
	G: "--.",
	H: "....",
	I: "..",
	J: ".---",
	K: "-.-",
	L: ".-..",
	M: "--",
	N: "-.",
	O: "---",
	P: ".--.",
	Q: "--.-",
	R: ".-.",
	S: "...",
	T: "-",
	U: "..-",
	V: "...-",
	W: ".--",
	X: "-..-",
	Y: "-.--",
	Z: "--..",
	"1": ".----",
	"2": "..---",
	"3": "...--",
	"4": "....-",
	"5": ".....",
	"6": "-....",
	"7": "--...",
	"8": "---..",
	"9": "----.",
	"0": "-----",
	".": ".-.-.-",
	",": "--..--",
	"?": "..--..",
	"/": "-..-.",
	"@": ".--.-.",
};
let msg = "";
let messageConverted = "";
let spaceCounter = 0;
let words = [];

let inputType;

let scene = "start";

// start scene
let input, inputBtn, keyboardInputBtn;

var socket;

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.style("z-index", "-1");
	canvas.position(0, 0);

	fill(255);
	textSize(windowHeight / 30);
	textAlign(CENTER, CENTER);

	// start scene
	// get elements from chatroom page
	input = select("#portName");
	inputBtn = select("#arduinoInput");
	keyboardInputBtn = select("#keyInput");

	inputBtn.mousePressed(() => {
		inputType = "Arduino";
		if (input.value() != "") portName = input.value();
		print("Using Arduino");
		scene = "morse";
	});
	keyboardInputBtn.mousePressed(() => {
		inputType = "key";
		print("Using keyboard");
		scene = "morse";
	});

	socket = io.connect("http://localhost:8080");
	socket.on("wordPush", socketPush);
}

function draw() {
	switch (scene) {
		case "start":
			startScene();
			break;
		case "morse":
			morseScene();
			break;
	}
}

// Following functions print the serial communication status to the console for debugging purposes
// We are connected and ready to go
function serverConnected() {
	print("We are connected!");
}

function printList(portList) {
	// portList is an array of serial port names
	for (var i = 0; i < portList.length; i++) {
		// Display the list the console:
		print(i + " " + portList[i]);
	}
}

// Connected to our serial device
function portOpen() {
	print("Serial Port is open!");
}

function portClose() {
	print("Serial port closed.");
	serialOn = false;
}

// Uh oh, here is an error, let's log it
function serialError(err) {
	print("Something went wrong with the serial port. " + err);
	scene = "start";
	serialOn = false;
}

function serialEvent() {
	let dataIn = serial.readLine();
	trim(dataIn);
	if (!dataIn) return;
	console.log(dataIn);

	if (scene == "morse") {
		switch (dataIn) {
			case ".":
				msg += ".";
				break;
			case "-":
				CENTER;
				msg += "-";
				break;
			case "space":
				spaceActivated();
				break;
		}
	}
	print("Morse from Arduino: " + msg);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	if (scene == "start") textSize(windowHeight / 30);
}

function startScene() {
	background(0);
	textSize(windowHeight / 30);

	text("PLEASE ENTER MORSE", windowWidth / 2, windowHeight / 2);
}

function socketPush(word) {
	// communicate with server, words from other people
	words.push(word);
}

function morseScene() {
	background(0);

	if (inputType == "Arduino") {
		if (!serialOn) {
			serialOn = true;
			//set up communication port
			serial = new p5.SerialPort(); // make a new instance of the serialport library
			serial.list();
			serial.open(portName);
			serial.on("connected", serverConnected); // callback for connecting to the server
			serial.on("list", printList); // set a callback function for the serialport list event
			serial.on("data", serialEvent); // callback for when new data arrives
			serial.on("error", serialError); // callback for errors
			serial.on("open", portOpen); // callback for the port opening
			serial.on("close", portClose); // callback for the port closing
		}
	}

	words.forEach((word) => {
		rotate(word.rotateDegrees);
		text(word.text, word.x, word.y);
	});
}

function translateMorse(code) {
	return typeof morseKey[code] === "undefined" ? "" : morseKey[code];
}

function convertLetter() {
	let word = {
		text: msg,
		x: random(75, windowWidth - 75),
		y: random(75, windowHeight - 75),
		rotateDegrees: random(1, 360),
	};
	print("Morse letter pushed: " + msg);
	socket.emit("wordPush", word);

	// translate single character
	messageConverted += translateMorse(msg);

	word = {
		text: messageConverted,
		x: random(75, windowWidth - 75),
		y: random(75, windowHeight - 75),
		rotateDegrees: random(1, 360),
	};
	print("Alpha letter pushed: " + messageConverted);
	socket.emit("wordPush", word);
	msg = "";

	print("Word: " + messageConverted);
}

function convertWord() {
	// yeet word onto canvas
	let word = {
		text: messageConverted,
		x: random(75, windowWidth - 75),
		y: random(75, windowHeight - 75),
		rotateDegrees: random(1, 360),
	};
	socket.emit("wordPush", word);
	print("Alpha word pushed: " + messageConverted);

	let convertToMorse = "";
	Array.from(messageConverted).forEach(
		(element) => (convertToMorse += alphaKey[element])
	);

	word = {
		text: convertToMorse,
		x: random(75, windowWidth - 75),
		y: random(75, windowHeight - 75),
		rotateDegrees: random(1, 360),
	};
	socket.emit("wordPush", word);
	print("Morse word pushed: " + convertToMorse);
	messageConverted = "";
}

function sendHelp() {
	let word = {
		text: "HELP",
		x: random(75, windowWidth - 75),
		y: random(75, windowHeight - 75),
		rotateDegrees: random(1, 360),
	};
	socket.emit("wordPush", word);

	word = {
		text: ".... . .-.. .--.",
		x: random(75, windowWidth - 75),
		y: random(75, windowHeight - 75),
		rotateDegrees: random(1, 360),
	};
	socket.emit("wordPush", word);

	print("Word HELP pushed");
}

function spaceActivated() {
	spaceCounter++;
	print("Spaces: " + spaceCounter);
	if (msg == "") {
		if (spaceCounter == 1) sendHelp();
		else convertWord();

		spaceCounter = 0;
	} else convertLetter();
}

function keyPressed() {
	if (scene == "morse") {
		if (keyCode === LEFT_ARROW) msg += ".";
		else if (keyCode === RIGHT_ARROW) msg += "-";
		else if (keyCode === DOWN_ARROW) spaceActivated();
		else if (keyCode == 8) msg = msg.substring(0, msg.length - 1); // backspace, delete

		print("Morse: " + msg);
	}
}

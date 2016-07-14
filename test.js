var Gpio = require('onoff').Gpio;
var io = require('socket.io-client');


var socket = io.connect('http://localhost:3000');

// Define available actions

//Play-stop toggle
function playpause(){
  console.log('Play/pause button pressed');
  socket.emit('getState','');

  socket.once('pushState', function (state) {
    console.log('State is:' + state.status);

    if(state.status=='play'){
      console.log('Stopping..\n');
      socket.emit('stop');
    } else {
      console.log('Starting..\n');
      socket.emit('play');
    }
  });
}

//Next on playlist
function next(){
  console.log('Next-button pressed\n');
  socket.emit('next')
}

//Previous on playlist
function previous(){
  console.log('Previous-button pressed\n');
  socket.emit('prev')
}

//Volume up
function volup(){
  console.log('Vol+ button pressed\n');
  socket.emit('volume','+');
}

//Volume down
function voldown(){
  console.log('Vol- button pressed\n');
  socket.emit('volume','-');
}

// Configuration
var rules = [];
rules[0] = {pin: 17, action:"playpause"};
rules[1] = {pin: 18, action:"volup"};

// Define buttons, set actions
var button = [];

for(var i = 0; i < rules.length; i++){
	//console.log(rules[i].action);
	button[i] = new Gpio(rules[i].pin,'in','falling');
	
	switch(rules[i].action){
		case "playpause":
			button[i].watch(playpause);
			break;
		case "next":
			button[i].watch(next);
			break;
		case "previous":
			button[i].watch(previous);
			break;
		case "volup":
			button[i].watch(volup);
			break;
		case "voldown":
			button[i].watch(voldown);
			break;
	}	
	
}


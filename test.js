var Gpio = require('onoff').Gpio;
var io = require('socket.io-client');


var socket = io.connect('http://localhost:3000');

var button = new Gpio(18, 'in', 'falling');

button.watch(function(err, value) {
  console.log('Button pressed');

  socket.emit('getState','');

  socket.once('pushState', function (state) {
    console.log('State is:' + state.status);

    if(state.status=='play'){
      console.log('Stopping..');
      socket.emit('stop');
    } else {
      console.log('Starting..');
      socket.emit('play');
    }
  });

});

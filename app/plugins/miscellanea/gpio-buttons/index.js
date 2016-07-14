'use strict';

var fs = require('fs-extra');
var config = new (require('v-conf'))();
var gpio = require('onoff').Gpio;

module.exports = GPIOButtons;

function GPIOButtons(context) {
	var self = this;
	self.context=context;
	self.commandRouter = self.context.coreCommand;
	self.logger = self.context.logger;
	self.triggers = [];
}


/*
 * This method can be defined by every plugin which needs to be informed of the startup of Volumio.
 * The Core controller checks if the method is defined and executes it on startup if it exists.
 */
GPIOButtons.prototype.onVolumioStart = function () {
	var self = this;
	//Perform startup tasks here
	self.configFile=self.commandRouter.pluginManager.getConfigurationFile(self.context,'config.json');
	config.loadFile(self.configFile);
	self.applyConf(self.getConf());
	self.logger.info("GPIO-Buttons initialized");

};

GPIOButtons.prototype.onStop = function () {
	var self = this;
	//Perform startup tasks here
};

GPIOButtons.prototype.onRestart = function () {
	var self = this;
	//Perform startup tasks here
};

GPIOButtons.prototype.onInstall = function () {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtons.prototype.onUninstall = function () {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtons.prototype.getUIConfig = function () {
	var self = this;

	var uiconf=fs.readJsonSync(__dirname+'/UIConfig.json');
	uiconf.sections[0].content[0].value=config.get('enabled');
	uiconf.sections[0].content[1].value=config.get('pin');
	uiconf.sections[0].content[2].value=config.get('trigger_value');
	uiconf.sections[0].content[3].value=config.get('action');

	return uiconf;
};

GPIOButtons.prototype.setUIConfig = function (data) {
	var self = this;
	//Perform your installation tasks here
	var uiconf=fs.readJsonSync(__dirname+'/UIConfig.json');
};

GPIOButtons.prototype.getConf = function () {
	var self = this;
	//Perform your installation tasks here

	var conf = [];
	try {
		var conf = JSON.parse(fs.readJsonSync(self.configFile));
	} catch(e) {}
	self.logger.info("GPIO-Buttons: Loading config file...");
	return conf;
};

GPIOButtons.prototype.clearTriggers = function () {
	var self = this;
	for (var i in self.triggers) {
		var trigger = self.triggers[i];
		self.logger.info("GPIO-Button: Destroying trigger + i");
		trigger.unwatchAll();
	}
};

GPIOButtons.prototype.setConf = function (conf) {
	var self = this;
	//Perform your installation tasks here
	self.clearTriggers();
	self.applyConf(conf);
	for (var i in conf){
		var item = conf[i];
		item.id = i;
	}
	fs.writeJsonSync(self.configFile,JSON.stringify(conf));
};

//Optional functions exposed for making development easier and more clear
GPIOButtons.prototype.getSystemConf = function (pluginName, varName) {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtons.prototype.setSystemConf = function (pluginName, varName) {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtons.prototype.getAdditionalConf = function () {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtons.prototype.setAdditionalConf = function () {
	var self = this;
	//Perform your installation tasks here
};

GPIOButtons.prototype.applyConf = function(conf) {
	var self = this;
	self.logger.info('GPIO-Buttons: Applying config file...');

	for (var i in conf){
		item = conf[i];

		self.logger.info('GPIO-Buttons: Set up GPIO listener on pin ' + item.pin);
		j = new Gpio(item.pin,'in','falling');

		switch(item.action){
			case "playpause":
				j.watch(self.playpause);
				break;
			case "next":
				j.watch(self.next);
				break;
			case "previous":
				j.watch(self.previous);
				break;
			case "volup":
				j.watch(self.volup);
				break;
			case "voldown":
				j.watch(self.voldown);
				break;
		}

		self.triggers.push(j)
	}


}

	GPIOButtons.prototype.playpause = function(){
		var self = this;
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
	GPIOButtons.prototype.next = function(){
	  console.log('Next-button pressed\n');
	  socket.emit('next')
	}

	//Previous on playlist
	GPIOButtons.prototype.previous = function(){
	  console.log('Previous-button pressed\n');
	  socket.emit('prev')
	}

	//Volume up
	GPIOButtons.prototype.volup = function(){
	  console.log('Vol+ button pressed\n');
	  socket.emit('volume','+');
	}

	//Volume down
	GPIOButtons.prototype.voldown = function(){
	  console.log('Vol- button pressed\n');
	  socket.emit('volume','-');
	}

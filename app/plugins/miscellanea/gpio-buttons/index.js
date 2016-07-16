'use strict';

var libQ = require('kew');
var fs = require('fs-extra');
var config = new (require('v-conf'))();
var Gpio = require('onoff').Gpio;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');


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

	return libQ.resolve();

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
	var defer = libQ.defer();
	var self = this;

	var lang_code = this.commandRouter.sharedVars.get('language_code');

        self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
                __dirname+'/i18n/strings_en.json',
                __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {

	uiconf.sections[0].content[0].value=config.get('enabled');
	uiconf.sections[0].content[1].value=config.get('pin');
	uiconf.sections[0].content[2].value=config.get('action');

            defer.resolve(uiconf);
            })
                .fail(function()
            {
                defer.reject(new Error());
        });

        return defer.promise;
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
		self.logger.info("GPIO-Button: Destroying trigger " + i);
		trigger.unwatchAll();
	}
	self.triggers = [];
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
	self.logger.info('GPIO-Buttons: Found ' + conf.length + ' items');
	for (var i in conf){
		var item = conf[i];

		self.logger.info('GPIO-Buttons: Setting up GPIO listener on pin ' + item.pin);
		var j = new Gpio(item.pin,'in','falling');

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
			default:
				self.logger.info('GPIO-Buttons: Action does not exist: ' + item.action)
				break;
		}

		self.triggers.push(j);

	}

}

GPIOButtons.prototype.saveTriggers=function(data)
{
	var self = this;

	var defer = libQ.defer();
	//console.log(data);
	//console.log(data['pin']['value']);

	var conf = [];
	conf[0] = {'pin': data['pin']['value'],
						 'action': data['action']['value']}

	self.setConf(conf);

	self.commandRouter.pushToastMessage('success',"GPIO-Buttons", "Configuration saved");

	defer.resolve({});
	return defer.promise;
};


GPIOButtons.prototype.playpause = function() {
	//self.logger.info('GPIO-Buttons: Play/pause button pressed');
  socket.emit('getState','');

  socket.once('pushState', function (state) {
    if(state.status=='play'){
      socket.emit('stop');
    } else {
			socket.emit('play');
    }
  });
}

//Next on playlist
GPIOButtons.prototype.next = function() {
  //self.logger.info('GPIO-Buttons: Next-button pressed');
  socket.emit('next')
}

//Previous on playlist
GPIOButtons.prototype.previous = function() {
  //self.logger.info('GPIO-Buttons: Previous-button pressed');
  socket.emit('prev')
}

//Volume up
GPIOButtons.prototype.volup = function() {
  //self.logger.info('GPIO-Buttons: Vol+ button pressed');
  socket.emit('volume','+');
}

//Volume down
GPIOButtons.prototype.voldown = function() {
  //self.logger.info('GPIO-Buttons: Vol- button pressed\n');
  socket.emit('volume','-');
}

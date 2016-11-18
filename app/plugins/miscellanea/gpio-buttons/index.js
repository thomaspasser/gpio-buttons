'use strict';

var libQ = require('kew');
var fs = require('fs-extra');
var Gpio = require('onoff').Gpio;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var actions = ["playpause", "volup", "voldown", "previous", "next", "shutdown"];

module.exports = GPIOButtons;

function GPIOButtons(context) {
	var self = this;
	self.context=context;
	self.commandRouter = self.context.coreCommand;
	self.logger = self.context.logger;
	self.triggers = [];
}

GPIOButtons.prototype.onStart = function () {
	var self = this;

	self.configFile=self.commandRouter.pluginManager.getConfigurationFile(self.context,'config.json');

	self.applyConf(self.getConf());
	self.logger.info("GPIO-Buttons initialized");

	return libQ.resolve();

};

GPIOButtons.prototype.onStop = function () {
	var self = this;

	self.clearTriggers();
	self.logger.info("GPIO-Buttons stopped")
	return libQ.resolve();
};

GPIOButtons.prototype.onRestart = function () {
	var self = this;

};

GPIOButtons.prototype.onInstall = function () {
	var self = this;

};

GPIOButtons.prototype.onUninstall = function () {
	var self = this;

};

GPIOButtons.prototype.getConf = function () {
	var self = this;

	self.conf = [];
	try {
		self.conf = JSON.parse(fs.readJsonSync(self.configFile));
	} catch (e) {}


	if(self.conf.length == 0){
		self.logger.info("GPIO-Buttons: Empty config, loading defaults...");

		// Generate defaults..
		self.conf = {};
		var j = 2;
		for(var i in actions){
			var action = actions[i];
			self.conf[action] = {
				"enabled": false,
				"pin": j,
				"value": 0
			}
			j = j + 1;
		}

	}

	return self.conf;

};

GPIOButtons.prototype.getUIConfig = function () {
	var defer = libQ.defer();
	var self = this;

	self.logger.info('GPIO-Buttons: Getting UI config');

	//Just for now..
	var lang_code = 'en';

	//var lang_code = this.commandRouter.sharedVars.get('language_code');

        self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
                __dirname+'/i18n/strings_en.json',
                __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {

  	self.conf = self.getConf();


		var i = 0;
		for(var action in self.conf){
			var item = self.conf[action];
			uiconf.sections[0].content[2*i].value = item.enabled;
			uiconf.sections[0].content[2*i+1].value.value = item.pin;
			uiconf.sections[0].content[2*i+1].value.label = item.pin.toString();
			i = i + 1;
		}

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

	var uiconf=fs.readJsonSync(__dirname+'/UIConfig.json');
};



GPIOButtons.prototype.clearTriggers = function () {
	var self = this;
	for (var i in self.triggers) {
		var trigger = self.triggers[i];
		self.logger.info("GPIO-Buttons: Destroying trigger " + i);

		trigger.unwatchAll();
		trigger.unexport();
	}
	self.triggers = [];
};

GPIOButtons.prototype.setConf = function (conf) {
	var self = this;

	self.clearTriggers();
	self.applyConf(conf);

	fs.writeJsonSync(self.configFile,JSON.stringify(conf));
};

GPIOButtons.prototype.getSystemConf = function (pluginName, varName) {
	var self = this;

};

GPIOButtons.prototype.setSystemConf = function (pluginName, varName) {
	var self = this;

};

GPIOButtons.prototype.getAdditionalConf = function () {
	var self = this;

};

GPIOButtons.prototype.setAdditionalConf = function () {
	var self = this;

};

GPIOButtons.prototype.applyConf = function(conf) {
	var self = this;
	self.conf = conf;
	self.logger.info('GPIO-Buttons: Applying config file...');

	for(var action in conf){
		var item = conf[action];
		if(item.enabled === true){
			self.logger.info('GPIO-Buttons: '+ self.getActionName(action) + ' on pin ' + item.pin);
			var j = new Gpio(item.pin,'in','both');
			j.watch(self.listener.bind(self,action));
			self.triggers.push(j);
		}
	}

}

GPIOButtons.prototype.saveTriggers=function(data)
{
	var self = this;

	var defer = libQ.defer();

	self.conf = {};
	for(var i in actions){
		var action = actions[i];

		self.conf[action] = {
			"enabled": data[action.concat('enabled')],
	    	"pin": data[action.concat('pin')]['value'],
	    	"value": 0
		}
	}

	self.setConf(self.conf);

	self.commandRouter.pushToastMessage('success',"GPIO-Buttons", "Configuration saved");

	defer.resolve({});
	return defer.promise;
};

GPIOButtons.prototype.getActionName = function(action) {
	var actionName;

	switch(action){
		case 'playpause':
			actionName = "Play/pause";
			break;
		case 'next':
			actionName = "Next";
			break;
		case 'previous':
			actionName = "Previous";
			break;
		case 'volup':
			actionName = "Vol+";
			break;
		case 'voldown':
			actionName = "Vol-";
			break;
		case 'shutdown':
			actionName = "Shutdown";
			break;
	}
	return actionName;
}

GPIOButtons.prototype.listener = function(action,err,value){
	var self = this;

	// IF change AND high (or low?)
	if(value !== self.conf[action].value && value === 1){
		//do thing
		self[action]();
	}
	// remember value
	self.conf[action].value = value;

}

GPIOButtons.prototype.playpause = function() {
	//this.logger.info('GPIO-Buttons: Play/pause button pressed');
  socket.emit('getState','');

  socket.once('pushState', function (state) {
    if(state.status=='play'){
      socket.emit('pause');
    } else {
			socket.emit('play');
    }
  });
}

//Next on playlist
GPIOButtons.prototype.next = function() {
  //this.logger.info('GPIO-Buttons: Next-button pressed');
  socket.emit('next')
}

//Previous on playlist
GPIOButtons.prototype.previous = function() {
  //this.logger.info('GPIO-Buttons: Previous-button pressed');
  socket.emit('prev')
}

//Volume up
GPIOButtons.prototype.volup = function() {
  //this.logger.info('GPIO-Buttons: Vol+ button pressed');
  socket.emit('volume','+');
}

//Volume down
GPIOButtons.prototype.voldown = function() {
  //this.logger.info('GPIO-Buttons: Vol- button pressed\n');
  socket.emit('volume','-');
}

//Shutdown
GPIOButtons.prototype.shutdown = function() {
  //this.logger.info('GPIO-Buttons: Shutdown button pressed\n');
  this.commandRouter.shutdown();
}

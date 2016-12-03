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


GPIOButtons.prototype.onVolumioStart = function () {
	var self = this;

	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

	self.logger.info("GPIO-Buttons initialized");

}


GPIOButtons.prototype.getConfigurationFiles = function()
{
	return ['config.json'];
}




GPIOButtons.prototype.onStart = function () {
	var self = this;

	var defer=libQ.defer();

	self.applyConf();
	self.logger.info("GPIO-Buttons started");

	return defer.promise;

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

		var i = 0;
		for(var j in actions){
			var action = actions[j]

			// Strings for config
			var c1 = action.concat('.enabled');
			var c2 = action.concat('.pin');
			uiconf.sections[0].content[2*i].value = self.config.get(c1);
			uiconf.sections[0].content[2*i+1].value.value = self.config.get(c2);
			uiconf.sections[0].content[2*i+1].value.label = self.config.get(c2).toString();
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

GPIOButtons.prototype.setConf = function () {
	var self = this;

	self.clearTriggers();
	self.applyConf();

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

GPIOButtons.prototype.applyConf = function() {
	var self = this;

	self.logger.info('GPIO-Buttons: Applying config file...');


	for(var i in actions){
		var action = actions[i];
		// Strings for config
		var c1 = action.concat('.enabled');
		var c2 = action.concat('.pin');

		var enabled = self.config.get(c1);
		var pin = self.config.get(c2);

		if(enabled === true){
			self.logger.info('GPIO-Buttons: '+ self.getActionName(action) + ' on pin ' + pin);
			var j = new Gpio(pin,'in','both');
			j.watch(self.listener.bind(self,action));
			self.triggers.push(j);
		}
	}

}

GPIOButtons.prototype.saveTriggers=function(data)
{
	var self = this;

	var defer = libQ.defer();

	for(var i in actions){
		var action = actions[i];

		// Strings for data fields
		var s1 = action.concat('enabled');
		var s2 = action.concat('pin');

		// Strings for config
		var c1 = action.concat('.enabled');
		var c2 = action.concat('.pin');
		var c3 = action.concat('.value');

		self.config.set(c1, data[s1]);
		self.config.set(c2, data[s2]['value']);
		self.config.set(c3, 0);

	}

	self.setConf();

	self.commandRouter.pushToastMessage('success',"GPIO-Buttons", "Configuration saved");

	defer.resolve({});
	return defer.promise;
}

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

	var c3 = action.concat('.value');
	var lastvalue = self.config.get(c3);

	// IF change AND high (or low?)
	if(value !== lastvalue && value === 1){
		//do thing
		self[action]();
	}
	// remember value
	self.config.set(c3,value);

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

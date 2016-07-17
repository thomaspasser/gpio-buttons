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

GPIOButtons.prototype.onVolumioStart = function () {
	var self = this;

	self.configFile=self.commandRouter.pluginManager.getConfigurationFile(self.context,'config.json');
	this.config = new(require('v-conf'))();
	this.config.loadFile(self.configFile);

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

  var conf = self.getConf();

	if(conf.length > 0){
		uiconf.sections[0].content[0].value= conf[0]['playpauseenabled'];

		uiconf.sections[0].content[1].value.value= conf[0]['playpausepin'];
		uiconf.sections[0].content[1].value.label= conf[0]['playpausepin'].toString();

		uiconf.sections[0].content[2].value= conf[0]['volupenabled'];

		uiconf.sections[0].content[3].value.value= conf[0]['voluppin'];
		uiconf.sections[0].content[3].value.label= conf[0]['voluppin'].toString();

		uiconf.sections[0].content[4].value= conf[0]['voldownenabled'];

		uiconf.sections[0].content[5].value.value= conf[0]['voldownpin'];
		uiconf.sections[0].content[5].value.label= conf[0]['voldownpin'].toString();

		uiconf.sections[0].content[6].value= conf[0]['previousenabled'];

		uiconf.sections[0].content[7].value.value= conf[0]['previouspin'];
		uiconf.sections[0].content[7].value.label= conf[0]['previouspin'].toString();

		uiconf.sections[0].content[8].value= conf[0]['nextenabled'];

		uiconf.sections[0].content[9].value.value= conf[0]['nextpin'];
		uiconf.sections[0].content[9].value.label= conf[0]['nextpin'].toString();

	}
	// else keep defaults from UIConfig.json

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

GPIOButtons.prototype.getConf = function () {
	var self = this;

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

	for (var i in conf){
		var item = conf[i];
		item.id = i;
	}
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

	self.logger.info('GPIO-Buttons: Applying config file...');

	//self.logger.info('GPIO-Buttons: Found ' + count + ' items');

	if(conf.length > 0){

		var item = conf[0];
		if(item.playpauseenabled === true){
			self.logger.info('GPIO-Buttons: Play/pause on pin ' + item.playpausepin);
			var j = new Gpio(item.playpausepin,'in','falling');
			j.watch(self.playpause);
			self.triggers.push(j);
		}

		if(item.volupenabled === true){
			self.logger.info('GPIO-Buttons: Vol+ on pin ' + item.voluppin);
			var j = new Gpio(item.voluppin,'in','falling');
			j.watch(self.volup);
			self.triggers.push(j);
		}

		if(item.voldownenabled === true){
			self.logger.info('GPIO-Buttons: Vol- on pin ' + item.voldownpin);
			var j = new Gpio(item.voldownpin,'in','falling');
			j.watch(self.voldown);
			self.triggers.push(j);
		}

		if(item.previousenabled === true){
			self.logger.info('GPIO-Buttons: Previous on pin ' + item.previouspin);
			var j = new Gpio(item.previouspin,'in','falling');
			j.watch(self.previous);
			self.triggers.push(j);
		}

		if(item.nextenabled === true){
			self.logger.info('GPIO-Buttons: Next on pin ' + item.nextpin);
			var j = new Gpio(item.nextpin,'in','falling');
			j.watch(self.next);
			self.triggers.push(j);
		}
	} else {
		self.logger.info('GPIO-Buttons: Empty configuration');
		}
}

GPIOButtons.prototype.saveTriggers=function(data)
{
	var self = this;

	var defer = libQ.defer();

	var conf = [];

	conf[0] = {
	  "playpauseenabled": data['playpauseenabled'],
	  "playpausepin": data['playpausepin']['value'],
	  "volupenabled": data['volupenabled'],
	  "voluppin": data['voluppin']['value'],
	  "voldownenabled": data['voldownenabled'],
	  "voldownpin": data['voldownpin']['value'],
	  "previousenabled": data['previousenabled'],
	  "previouspin": data['previouspin']['value'],
	  "nextenabled": data['nextenabled'],
	  "nextpin": data['nextpin']['value']
	}

/*
	conf[0] = {'enabled': data['enabled'],
						'pin': data['pin']['value'],
						'action': data['action']['value']}
*/
	self.setConf(conf);

	self.commandRouter.pushToastMessage('success',"GPIO-Buttons", "Configuration saved");

	defer.resolve({});
	return defer.promise;
};

/*
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
	}
	return actionName;
}
*/

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

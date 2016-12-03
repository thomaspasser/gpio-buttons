#!/bin/bash

echo "Initializing config"
mkdir /data/configuration/miscellanea/gpio-buttons
#touch /data/configuration/miscellanea/gpio-buttons/config.json

chown -R volumio:volumio /data/configuration/miscellanea/gpio-buttons

if [ ! -f "/lib/udev/rules.d/91-gpio.rules" ];
	then
		echo "GPIO permission rules doesn't exist, creating"
		cp /data/plugins/miscellanea/gpio-buttons/fix.tar.gz /
		cd /
		sudo tar -xvf fix.tar.gz
		rm /fix.tar.gz
	else
		echo "GPIO permission rules already exists"
fi

echo "plugininstallend"

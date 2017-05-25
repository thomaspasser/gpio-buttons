#!/bin/bash

echo "Initializing config"

# compatibilty with earlier config files due to few commands name change
if [ -f /data/configuration/miscellanea/gpio-buttons/config.json ];then
	sed -i 's/playpause/playPause/g' /data/configuration/miscellanea/gpio-buttons/config.json
	sed -i 's/volup/volumeUp/g' /data/configuration/miscellanea/gpio-buttons/config.json
	sed -i 's/voldown/volumeDown/g' /data/configuration/miscellanea/gpio-buttons/config.json
fi

echo "plugininstallend"

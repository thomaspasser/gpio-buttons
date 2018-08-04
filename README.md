# gpio-buttons

NOTE: This repository is not up to date, development has moved here: https://github.com/volumio/volumio-plugins/tree/master/plugins/system_controller/gpio-buttons

Work in progress for a GPIO button plugin for volumio2 on the raspberry pi. Uses node js library 'onoff'.

Currently 6 actions can be attached to gpio pins: Play/pause, Vol+, Vol-, Next track, Previous track and shutdown.

![GPIO Buttons interface](http://tomatpasser.dk/gpio-buttons2.png)

#Installation

- Download zip for install in volumio2 here: http://tomatpasser.dk/gpio-buttons.zip
- Got to Plugins -> Upload plugin and upload the file
- Each action can then be enabled and the GPIO pin selected.

The pin numbers entered should be GPIO pin numbers. The GPIO pins have an internal pull-up/pull-down resistor. The default value for each pin is shown below. As of now it is not possible to control the pull in the configuration. 

__Remember never to connect 5V to the GPIO pins, only 3.3V or ground.__

__Connection of a GPIO to a voltage higher than 3.3V will likely destroy the GPIO block within the SoC.__

The button should be wired between the GPIO pin and __opposite__ voltage as the default pull. The plugin will detect any change on the GPIO pin.

Example: If using GPIO pin 17, the button should be wired between the pin and 3.3V (high) because the default pull is low for GPIO pin 17.


| GPIO Pin      | Default pull  | GPIO Pin      | Default pull  |
| :-----------: |:-------------:| :-----------: |:-------------:|
| 2             | high          | 15            | low           |
| 3             | high          | 16            | low           |
| 4             | high          | 17            | low           |
| 5             | high          | 18            | low           |
| 6             | high          | 19            | low           |
| 7             | high          | 20            | low           |
| 8             | high          | 21            | low           |
| 9             | low           | 22            | low           |
| 10            | low           | 23            | low           |
| 11            | low           | 24            | low           |
| 12            | low           | 25            | low           |
| 13            | low           | 26            | low           |
| 14            | low           | 27            | low           |

__Schematic showing wiring example for pin 17__

<img src="http://tomatpasser.dk/gpio_schematics.png" width=500>

#TODO
- Control of internal pull resistor
- Support for rotary encoder to control volume
- Custom commands

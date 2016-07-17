# gpio-buttons

Work in progress for a GPIO button plugin for volumio2 on the raspberry pi. Uses node js library 'onoff'.

Currently 5 actions can be attached to gpio pins: Play/pause, Vol+, Vol-, Next track and Previous track.

#Installation

- Download zip for install in volumio2 here: http://tomatpasser.dk/gpio-buttons.zip
- Got to Plugins -> Upload plugin and upload the file
- Each action can then be enabled and the GPIO pin selected.

The pin numbers entered should be GPIO pin numbers. The GPIO pins have an internal pull-up/pull-down resistor. The default value for each pin is shown below. As of now it is not possible to control the pull in the configuration. 

The button should be wired between the GPIO pin and opposite voltage as the default pull. The plugin will detect any change on the GPIO pin.

Example: If using GPIO pin 17, the button should be wired between the pin and 5V (high) because the default pull is low for GPIO pin 17.

| GPIO Pin      | Default pull  |
| :-----------: |:-------------:|
| 2             | high          |
| 3             | high          |
| 4             | high          |
| 5             | high          |
| 6             | high          |
| 7             | high          |
| 8             | high          |
| 9             | low           |
| 10            | low           |
| 11            | low           |
| 12            | low           |
| 13            | low           |
| 14            | low           |
| 15            | low           |
| 16            | low           |
| 17            | low           |
| 18            | low           |
| 18            | low           |
| 19            | low           |
| 20            | low           |
| 21            | low           |
| 22            | low           |
| 23            | low           |
| 24            | low           |
| 25            | low           |
| 26            | low           |
| 27            | low           |


#TODO
- Control of internal pull resistor
- Support for rotary encoder to control volume
- Custom commands

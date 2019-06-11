# Preciseley Spectro Scan Module
This module is for Preciseley Spectro Scan spectrometers.

# Dependencies
The Spectro Scan API require 2 applications be installed in order to be used.

Applications:

* [LabView Runtime 2012](http://www.ni.com/download/labview-run-time-engine-2012-sp1/3709/en/)
* [FTDI D2XX Drivers](https://www.ftdichip.com/Drivers/D2XX.htm)

package.json:

* [ffi v2.2.0](https://www.npmjs.com/package/ffi)
* [ref v1.3.5](https://www.npmjs.com/package/ref)
* [ref-array v1.2.0](https://www.npmjs.com/package/ref-array)
* Associated @types in devDependencies

## Installation

* LabView Runtime Engine 2012
* FTDI Drivers
* [node-gyp](https://github.com/nodejs/node-gyp) : Follow instructions for OS

``` command
npm install
```

## Build

Build typescript

``` command
tsc
```

Run TSLint

``` command
tslint -c tslint.json -p tsconfig.json
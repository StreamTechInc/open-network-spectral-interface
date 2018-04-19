# SeaBreeze Spectrometers Module

This module is for Ocean Optics spectrometers that conform to the [SeaBreeze API](https://oceanoptics.com/product/seabreeze/).

## Dependencies

The SeaBreeze API requires a couple applications and a specfic version of NodeJS to be installed.

Applications:

* [NodeJS v6.12.1](https://nodejs.org/download/release/v6.12.1/)
* [SeaBreeze Installer](https://sourceforge.net/projects/seabreeze/)
* [OmniDriver](https://oceanoptics.com/support/software-downloads/#omnidriver)

package.json:

* [ffi v2.2.0](https://www.npmjs.com/package/ffi)
* [ref v1.3.5](https://www.npmjs.com/package/ref)
* [ref-array v1.2.0](https://www.npmjs.com/package/ref-array)
* Associated @types in devDependencies

## Installation

* SeaBreeze API
* OmniDriver
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
```


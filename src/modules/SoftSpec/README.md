# Stream Tech Inc SoftSpec Hardware

This module is a software spectrometer to be used when needing to a spectrometer but don't have access to a physical device.

## Dependencies

SoftSpec modules does not require any special packages or applications.

## Installation

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

## How to use

The SoftSpec device has a property named 'scan_filename'. The purpose is to indicate what JSON file to read sample data from. Any new sample data can be added the 'scan files' directory.
When capture is called the scan files directory will be searched for a matching file and return slightly modified values.
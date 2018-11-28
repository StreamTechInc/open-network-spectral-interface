# Open Network Spectral Interface

The Open Network Spectral Interface (ONSI) provides a standard command and control interface for spectrometers and multi-spectral imaging devices. This project uses electron to create a installable application.

## Getting Started

The following instructions will get you up and running without any additional modules. For special instructions on how to get modules running please refer to its readme file.

### Prerequistes

* [NodeJS](https://nodejs.org)
* View module readme files for more dependencies

### Installation

Module README will contain further module dependent installation instructions.

``` command
npm install
```

### Build Steps

Module README will contain further module dependent build steps.

``` command
npm run electron
```

## Adding your own module

The project is built with ease of adding modules in mind. Each module will be responsible for handling the communication between the device and the outside world.
There is a directory format and specific interfaces each modules must adhere to in order to be added to the main branch.
The following are the general steps required to create a new module. Generic interface implementation classes can be found in src/models.

Required files for each module:

* IHardwareType implementation
* IHardware implementation
* Module README

### Setting up modules directory

This is as simple as adding a directory under src/modules with the name of the module you are adding. All files required by the module (outside of node_modules) will be added here.

### Add required interface implementations

There are 2 interfaces that must be implemented by the module in order to work. They are IHardwareType and IHardware. After implementing the 2 required classes you would then update src/modules/HardwareTyes.ts. In that class there is a section for where to add the import statement for your module and a section in the HardwareTypes class constructor where you add an instance of you IHardwareType implementation.

#### IHardwareType

This interface is responsible for dealing with devices of its type. It will handle getting all connected devices of its type and getting a device by its GUID.
Any module specific device initialization will also be done in this module.

This interface has 2 functions:

* GetDevices() : Returns an array of IHardware of the module type.
* GetDeviceById(id: string) : Return a single instance of IHardware based on the ID provided

#### IHardware

This interface is responsible for dealing with a specific connected device. Any communication with the device is done through this interface. Not all devices will require all functions so for functions not used by device simply return 'undefined'.

This interface has 4 properties:

* id : GUID unique ID at API runtime
* modelName : Model name or number of the device
* serial : Serial number of the device
* type : Identifier of device type, typically the module name.

and 10 functions:

* GetProperties() : Returns Promise to return a list of all properties for the device as an array of IProperty
* GetProperty(key: string) : Returns Promise to return a specific property based off the ID
* SetProperty(property: IProperty) : Returns Promise to set a property to the value supplied. Any additional property validation would be done here. Returns the complete updated IProperty. If any errors occur the error would be returned in place of the IProperty.
* Capture() : Returns Promise to return an array of capture data from a successful capture. If any errors occur the error would be returned in place of the ICaptureData array.
* GetStatus() : Returns the status details of the device.
* GetSubscriptions() : Returns an array of all ISubscriptions of the device.
* AddSubscription(subscription: ISubscription) : Validate and add the provided ISubscription to the device.
* DeleteSubscription(subscription: ISubscription) : Validate, shutdown and delete the provided ISubscription.
* GetStreamUri() : Return the string Uri of where stream is hosted.
* ToggleStream() : Toggle the stream on and off, returning the current state as a boolean.

### Updating project's package.json

When adding module dependencies to the project's package.json you must also add to the 'dependencies' section of your module's readme. This will make it easier for users of the project to remove modules they don't require and their dependencies. See below for expected module readme format.

### Module README

Each module is required to have a README markdown file. The following sections must be included:

* about - Quick info about what the module is used for
* dependencies - Any dependencies in project package.json, module directory or for installtion
* installation - Steps for installing every module dependency
* build - Steps for building the module as part of the project

## Contribute

Please read [CONTRIBUTING.md](https://github.com/StreamTechInc/open-network-spectral-interface/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

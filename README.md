# React Native Robotics Programing UI

| Build        | Status           |  
| ------------- |:---| 
| [Release]()      | [![Build status](https://build.appcenter.ms/v0.1/apps/16514b80-c28d-43e3-87a8-cea2c095cbe9/branches/master/badge)](https://appcenter.ms)| 
| [Beta](https://play.google.com/apps/testing/org.exploreit.robotics)   | [![Build status](https://build.appcenter.ms/v0.1/apps/16514b80-c28d-43e3-87a8-cea2c095cbe9/branches/develop/badge)](https://appcenter.ms)      | 


## Development:

This app is based on React Native 0.60.xx. 

### Requirements:

* Node.js  >= 10.0 && < 11.0
* Npm >= 6.0.0
* React Native CLI == 0.60.5

### Install:

```
$ npm install
```

or

```
$ yarn install
```

# Versioning

In a React Native app different tools and technologies come together, like JavaScript, npm, Android, iOS, Gradle and Xcode. This fact requires from developers to manage versioning at several locations for each app. Keeping them all in sync manually is a tedious and error prone task but fortunately, there is [react-native-version](https://www.andreadelis.com/react-native-app-versioning/) tool, an easier way to do it with a single command!

Examples:

```
$ npm version 0.5.0  // set app version to 0.5.0
$ npm version patch  // increment patch number
$ npm version minor  // increment minor number
$ npm version major  // increment major number
```

# Tagging Releases

Use the *Annotated Tag* support by Git to tag releases on the master branch with a descriptive message like:

```
$ git tag -a v1.0.0 -m "Releasing version v1.0.0"
$ git push origin v1.0.0
```

# Development Environment

**The app does NOT use [Expo](https://expo.io/)!**

Follow the instructions [Building Projects with Native Code](https://facebook.github.io/react-native/docs/getting-started) provided by the React Native team to setup the development environment for both android and ios. You'll need [Node](https://nodejs.org/en/download/), the [React Native CLI](https://facebook.github.io/react-native/docs/getting-started#the-react-native-cli), [Xcode](https://itunes.apple.com/us/app/xcode/id497799835?mt=12) and a Text Editor like [Visual Studio Code](https://code.visualstudio.com/). That's all!  

## Run App on Android

**NOTE**: You will need [Java 8](https://facebook.github.io/react-native/docs/getting-started#java-development-kit).

Have an Android emulator running (quickest way to get started), or a device connected

```
$ emulator -list-avds
Nexus_6_API_25
$ emulator @Nexus_6_API_25
$ react-native run-android
...
$ react-native log-android
```

## Run App on iOS

No need to start a simulator first! Run command

```
$ react-native run-ios
...
$ react-native log-ios
```

to start simulator (from Xcode) and deploy app or deploy app onto attached iPhone.

**NOTE**:

- Several starts are needed for the first time! The whole compilation cycle takes too long to finish in time.
- **Signing** properties in Xcode are needed. Start Xcode and go to the "Signing" paragraph.

# Upgrading the React Native Version

The app depends on several libraries, which have native components. They are:

 - for BLE: `react-native-ble-plx`
 - for Navigation: `react-navigation` with `react-native-gesture-handler`
 - for Material Design: `react-native-vector-icons`

To use them in android and ios, they must be *linked* to the target platform with:

```
$ react-native link react-native-ble-plx
$ react-native link react-native-gesture-handler
$ react-native link react-native-vector-icons
```

# Hints for BLE support

The library used in this project to support BLE is: https://github.com/Polidea/react-native-ble-plx
```
$ npm install --save react-native-ble-plx
$ react-native link react-native-ble-plx

$ npm install
```

## Found UIDs

```
service uuid:        0000ffe0-0000-1000-8000-00805f9b34fb
characteristic uuid: 0000ffe1-0000-1000-8000-00805f9b34fb
```




Read project [react-native-plx-ble](https://github.com/Polidea/react-native-ble-plx) carefully. Their are some updates needed 
    
 - for Android in `app/build.gradle` and `AndroidManifest.xml`!
 - for iOS. Open Xcode and add empty Swift file

# Adding AppCenter

To distribute the App during the development cycle the Cloud Service [AppCenter](https://visualstudio.microsoft.com/de/app-center/) will be used.

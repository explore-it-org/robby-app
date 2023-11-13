# React Native Robotics Programing UI

| Build        | Status           |  
| ------------- |:---| 
| [Release]()      | [![Build status](https://build.appcenter.ms/v0.1/apps/16514b80-c28d-43e3-87a8-cea2c095cbe9/branches/master/badge)](https://appcenter.ms)| 
| [Beta](https://play.google.com/apps/testing/org.exploreit.robotics)   | [![Build status](https://build.appcenter.ms/v0.1/apps/16514b80-c28d-43e3-87a8-cea2c095cbe9/branches/develop/badge)](https://appcenter.ms)      | 


## Development:

This app is based on React Native 0.63

### Requirements:

* Node.js  >= 10.0 && < 11.0
* Npm >= 6.0.0
* React Native CLI == 0.63

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

It seems like Node 16 or lower is required. Make sure you have the default node version set to 16, if you use nvs/nvm, as expo will start in a different shell.

## Run App on Android

**NOTE**: You must use [Java 8](https://facebook.github.io/react-native/docs/getting-started#java-development-kit). You may have to switch your JRE:

```sh
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
```

Note2: It seems like 1.8 doesn't work either, but 11 seems to be ok. TODO: Fix that whole mess.

See [here](https://medium.com/@devkosal/switching-java-jdk-versions-on-macos-80bc868e686a) for more details.

To run on a device you need to also make sure adb is in your path, e.g.

```sh
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
```

Have an Android emulator running (quickest way to get started), or a device connected

```
$ emulator -list-avds
Nexus_6_API_25
$ emulator @Nexus_6_API_25
$ yarn react-native run-android
...
$ yarn react-native log-android
```

## Run App on iOS

Only works on MacOs.

Do not run app with react native cli!

Run `pod install` inside the `ios` folder if you have cloned this repo for the first time.

### Setup BLE

1. run `open ios/Robotics.xcworkspace/
    1. Select/New/File...
    2. Choose Swift file and click `Next`
    3. Name it as you wish (does not matter)
    4. Accept to create Objective-C bridging header
2. manuel link ble by adding following lines to `ios/Podfile`
    ```
    pod 'react-native-ble-plx', :path => '../node_modules/react-native-ble-plx'
    pod 'react-native-ble-plx-swift', :path => '../node_modules/react-native-ble-plx'
    ``` 
3. in `ios` folder run `pod update` 
4. starting from iOS 13 add `NSBluetoothAlwaysUsageDescription` to `info.plist`

### Setup realm db
1. run `open node_modules/realm/src/RealmJS.xcodeproj`
2. go to target
3. delete testTarget
4. pod update
5. clean build folder (xcode)

**NOTE**: 
This steps must be completed every single time you install or update the realm packages.

### Actually run iOS build

1. connect iPhone and Mac to the same network. The choosen network must be connect to the world wide web and also must no block websocket connection between Mac and iPhone.
2. connect iPhone and Mac with the lightning cable. 
3. select  iPhone as build target
5. in xcode click on project
    1. choose Robotics target
        1. click on signing & capabilities and select you (or Dominik Gruntz) appelID from the team dropdwon
    2. repeat this step for RoboticsTests target
4. run the app



# Upgrading the React Native Version

60.5 is the latest version we are able to support. 

In case the [ble-library](https://github.com/Polidea/react-native-ble-plx) suddenly decided to support 60.5 + you may use the react-native [upgrade tool](https://facebook.github.io/react-native/docs/upgrading) to upgrade. 

If you have to update multiple version it might be easier to just create a new project.



## Found UIDs

```
service uuid:        0000ffe0-0000-1000-8000-00805f9b34fb
characteristic uuid: 0000ffe1-0000-1000-8000-00805f9b34fb
```


# Adding AppCenter

To distribute the App during the development cycle the Cloud Service [AppCenter](https://visualstudio.microsoft.com/de/app-center/) will be used.

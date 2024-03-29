# React Native Robotics Programing UI

## Development

This app is based on React Native 0.63

### Requirements

* Node.js  >= 10.0 && < 11.0
* Npm >= 6.0.0
* React Native CLI == 0.63

### Install

```sh
yarn install
```

## Versioning

In a React Native app different tools and technologies come together, like JavaScript, npm, Android, iOS, Gradle and Xcode. This fact requires from developers to manage versioning at several locations for each app. Keeping them all in sync manually is a tedious and error prone task but fortunately, there is [react-native-version](https://www.andreadelis.com/react-native-app-versioning/) tool, an easier way to do it with a single command!

Examples:

```sh
yarn version 0.5.0  # set app version to 0.5.0
yarn version patch  # increment patch number
yarn version minor  # increment minor number
yarn version major  # increment major number
```

### Tagging Releases

Use the *Annotated Tag* support by Git to tag releases on the master branch with a descriptive message like:

```sh
git tag -a v1.0.0 -m "Releasing version v1.0.0"
git push origin v1.0.0
```

## Development Environment

**The app does NOT use [Expo](https://expo.io/)!**

Follow the instructions [Building Projects with Native Code](https://facebook.github.io/react-native/docs/getting-started) provided by the React Native team to setup the development environment for both android and ios. You'll need [Node](https://nodejs.org/en/download/), the [React Native CLI](https://facebook.github.io/react-native/docs/getting-started#the-react-native-cli), [Xcode](https://itunes.apple.com/us/app/xcode/id497799835?mt=12) and a Text Editor like [Visual Studio Code](https://code.visualstudio.com/). That's all!  

It seems like Node 16 or lower is required. Make sure you have the default node version set to 16, if you use nvs/nvm, as expo will start in a different shell. For higher node versions you will get
an error like this:

```plain
Failed to construct transformer:  Error: error:0308010C:digital envelope routines::unsupported
```

### Run App on Android

**NOTE**: You must use [Java 8](https://facebook.github.io/react-native/docs/getting-started#java-development-kit) (It seems like 1.8 doesn't work either, but 11 seems to be ok. TODO: Fix that whole mess). You may have to switch your JRE:

```sh
export JAVA_HOME=`/usr/libexec/java_home -v 11`
```

See [here](https://medium.com/@devkosal/switching-java-jdk-versions-on-macos-80bc868e686a) for more details.

To run on a device you need to also make sure adb is in your path, e.g.

```sh
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
```

Have an Android emulator running (quickest way to get started), or a device connected

```sh
$ emulator -list-avds
Nexus_6_API_25
$ emulator @Nexus_6_API_25
$ yarn react-native run-android
...
$ yarn react-native log-android
```

### Run App on iOS

Only works on MacOs.

Do not run app with react native cli!

Run `pod install` inside the `ios` folder if you have cloned this repo for the first time.

#### Setup BLE

1. run `open ios/Robotics.xcworkspace/
    1. Select/New/File...
    2. Choose Swift file and click `Next`
    3. Name it as you wish (does not matter)
    4. Accept to create Objective-C bridging header
2. manuel link ble by adding following lines to `ios/Podfile`

    ```sh
    pod 'react-native-ble-plx', :path => '../node_modules/react-native-ble-plx'
    pod 'react-native-ble-plx-swift', :path => '../node_modules/react-native-ble-plx'
    ```

3. in `ios` folder run `pod update`
4. starting from iOS 13 add `NSBluetoothAlwaysUsageDescription` to `info.plist`

#### Setup realm db

1. run `open node_modules/realm/src/RealmJS.xcodeproj`
2. go to target
3. delete testTarget
4. pod update
5. clean build folder (xcode)

**NOTE**: These steps must be completed every single time you install or update the realm packages.

#### Actually run iOS build

1. connect iPhone and Mac to the same network. The choosen network must be connect to the world wide web and also must no block websocket connection between Mac and iPhone.
2. connect iPhone and Mac with the lightning cable.
3. select  iPhone as build target
4. in xcode click on project
    1. choose Robotics target
        1. click on signing & capabilities and select you (or Dominik Gruntz) appelID from the team dropdwon
    2. repeat this step for RoboticsTests target
5. run the app

## Upgrading the React Native Version

60.5 is the latest version we are able to support.

In case the [ble-library](https://github.com/Polidea/react-native-ble-plx) suddenly decided to support 60.5 + you may use the react-native [upgrade tool](https://facebook.github.io/react-native/docs/upgrading) to upgrade.

If you have to update multiple version it might be easier to just create a new project.

## Found UIDs

```plain
service uuid:        0000ffe0-0000-1000-8000-00805f9b34fb
characteristic uuid: 0000ffe1-0000-1000-8000-00805f9b34fb
```

## Adding AppCenter

To distribute the App during the development cycle the Cloud Service [AppCenter](https://visualstudio.microsoft.com/de/app-center/) will be used.

### AppCenter not working correctly

Currently AppCenter seems to have a problem releasing the app. To manually create a release:

* Update version numbers in android/app/build.gradle, ios/Robotics.xcodeproj/project.pbxproj, src/utillity/Global.js and package.json
* Optionally update version numbers in ios/Robotics-tvOSTests/Info.plist and ios/RoboticsTests/Info.plist but I don't think it's needed really
* Commit and push
* For Android
  * Make sure you run Node 16 (`nvs use 16`, if using nvs)
  * Go to android folder, and run `./gradlew bundleRelease`
  * Copy Bundle: `cp app/build/outputs/bundle/release/app.aab ~/Desktop/Robo.aab`
  * Upload manually to play store
* For iOS
  * TBD

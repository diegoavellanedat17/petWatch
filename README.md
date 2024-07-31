# Getting Started

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ JDK that ships _with_ React Native.
Don't forget to have the java and adb in the path

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npx react-native start
```

## Step 2: Start PetWatch in a new terminal physical device USB

```bash
adb devices
npx react-native run-android
```

## Step 3: Generate the apk fr testing

### For Android

```bash

npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

mkdir -p android/app/src/main/assets

cd android
./gradlew assembleRelease

adb install app-release.apk

```

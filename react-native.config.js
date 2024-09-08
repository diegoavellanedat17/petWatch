module.exports = {
  assets: ['./assets/fonts'],
  dependencies: {
    'react-native-camera': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-camera/android',
        },
      },
    },
  },
};

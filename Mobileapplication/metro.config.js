const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
    nonInlineRequires: [
      'react-native-gesture-handler',
      'react-native-reanimated',
    ],
  },
});

module.exports = config;

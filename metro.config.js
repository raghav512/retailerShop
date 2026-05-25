const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    blockList: [
      /node_modules\/@react-native-firebase\/.*\/android\/build\/.*/,
    ],
    assetExts: defaultConfig.resolver.assetExts,
    sourceExts: defaultConfig.resolver.sourceExts,
  },
  watchFolders: [path.resolve(__dirname)],
  // Disable Watchman on Windows — fall back to Node.js fs.watch
  watcher: {
    watchman: null,
    healthCheck: {
      enabled: true,
      timeout: 30000,
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);

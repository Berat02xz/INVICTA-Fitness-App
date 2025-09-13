module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-flow-strip-types'],
    ['@babel/plugin-proposal-export-namespace-from', { loose: true }],
    'react-native-reanimated/plugin',
  ],
};

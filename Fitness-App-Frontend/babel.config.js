module.exports = {
  presets: ['babel-preset-expo'], // since you use Expo
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-flow-strip-types'],
  ],
};

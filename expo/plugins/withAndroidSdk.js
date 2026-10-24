const { withGradleProperties } = require('expo/config-plugins');
// Expo SDK 58 native dependencies require API 37; target behavior remains API 36.
module.exports = function withAndroidSdk(config) {
  return withGradleProperties(config, config => {
    const values = {
      'android.compileSdkVersion': '37',
      'android.targetSdkVersion': '36',
      'android.buildToolsVersion': '36.0.0',
    };
    config.modResults = config.modResults.filter(entry => entry.type !== 'property' || !(entry.key in values));
    for (const [key, value] of Object.entries(values)) config.modResults.push({ type: 'property', key, value });
    return config;
  });
};

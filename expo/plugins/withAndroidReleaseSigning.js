const { withAppBuildGradle } = require('expo/config-plugins');
module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const marker = '// PickMe release signing from build environment';
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents += `
${marker}
if (System.getenv('PICKME_UNSIGNED_BUILD') == '1') {
    android.buildTypes.release.signingConfig = null
} else if (System.getenv('PICKME_KEYSTORE_PATH')) {
    android.signingConfigs.create('pickmeRelease') {
        storeFile file(System.getenv('PICKME_KEYSTORE_PATH'))
        storePassword System.getenv('PICKME_KEYSTORE_PASSWORD')
        keyAlias System.getenv('PICKME_KEY_ALIAS')
        keyPassword System.getenv('PICKME_KEY_PASSWORD')
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.pickmeRelease
}
`;
    }
    return config;
  });
};

module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      './plugins/withAndroidReleaseSigning',
      './plugins/withAndroidSdk',
      // Android uses autolinking and the package + certificate registered in Google Cloud.
      // The library's non-Firebase plugin only configures the iOS URL scheme.
      ...(iosClientId ? [['@react-native-google-signin/google-signin', {
        iosUrlScheme: `com.googleusercontent.apps.${iosClientId.replace(/\.apps\.googleusercontent\.com$/, '')}`,
      }]] : []),
    ],
  };
};

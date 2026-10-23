const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const buildRoot = process.env.PICKME_BUILD_DIR || '/tmp/pickme-android-build';
const credentialsPath = process.env.PICKME_ANDROID_CREDENTIALS || path.join(root, '.credentials/android.json');
if (!fs.existsSync(credentialsPath)) throw new Error('Missing signing credentials. See ANDROID_BUILD.md.');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
for (const key of ['keystorePath','storePassword','keyAlias','keyPassword']) if (!credentials[key]) throw new Error(`Missing signing field: ${key}`);
if (!fs.existsSync(credentials.keystorePath)) throw new Error('Keystore file does not exist.');
if (!process.env.EXPO_PUBLIC_API_BASE_URL || !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) throw new Error('Set the production API URL and Google Web Client ID before building.');
if (fs.existsSync(buildRoot) && fs.readdirSync(buildRoot).length) throw new Error('Build directory must be empty; choose a fresh PICKME_BUILD_DIR.');
fs.mkdirSync(buildRoot, { recursive: true });
for (const entry of fs.readdirSync(root)) {
  if (['.git','.credentials','.expo','node_modules','android','ios','dist','web-build','releases','docs'].includes(entry) || entry.startsWith('.env') || entry.endsWith('.log')) continue;
  fs.cpSync(path.join(root, entry), path.join(buildRoot, entry), { recursive: true });
}
fs.symlinkSync(path.join(root, 'node_modules'), path.join(buildRoot, 'node_modules'), 'dir');
const env = { ...process.env, CI:'1', EXPO_NO_TELEMETRY:'1',
  PICKME_KEYSTORE_PATH:credentials.keystorePath,
  PICKME_KEYSTORE_PASSWORD:credentials.storePassword,
  PICKME_KEY_ALIAS:credentials.keyAlias,
  PICKME_KEY_PASSWORD:credentials.keyPassword,
};
function run(command, args, cwd) {
  const result = spawnSync(command,args,{cwd,env,stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
run(process.execPath,[path.join(root,'node_modules/expo/bin/cli'),'prebuild','--platform','android','--no-install'],buildRoot);
run('./gradlew',[':app:assembleRelease','--no-daemon','--max-workers=1','-PreactNativeArchitectures=arm64-v8a','-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=512m','-Dkotlin.daemon.jvm.options=-Xmx512m'],path.join(buildRoot,'android'));
const apk = path.join(buildRoot,'android/app/build/outputs/apk/release/app-release.apk');
const version = JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo.version;
const output = path.join(root,'releases',`pickme-${version}-arm64.apk`);
fs.mkdirSync(path.dirname(output),{recursive:true});fs.copyFileSync(apk,output);
console.log(`Signed APK: ${output}`);

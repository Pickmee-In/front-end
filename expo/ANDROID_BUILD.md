# Build Android PickMe

Target awal: APK release ARM64 untuk instalasi langsung. Kode JS dibundel dalam
APK sehingga tidak membutuhkan Metro atau Expo Go. API menggunakan
`https://pickme.nekomik.web.id`.

## Google Login Android

Login native memakai `@react-native-google-signin/google-signin`. ID token Google
dikirim ke `/api/auth/google`; access token dan refresh token PickMe disimpan
melalui SecureStore. Tidak ada client secret atau credential database di APK.

Project yang dipilih untuk Android: `pickme-508408`. Gunakan Web Client ID dari
project yang sama; Web Client lama berasal dari project berbeda.

Di Google Cloud project yang memiliki OAuth Web Client PickMe:

1. Buka Google Auth Platform → Clients → Create client.
2. Pilih Android, nama `PickMe Android`.
3. Package: `com.pickmein.app`.
4. SHA-1 sertifikat release lokal:
   `27:50:F7:02:18:B0:86:8E:1D:DB:1D:2A:A5:74:22:63:B0:CA:E3:A1`.
5. Simpan. Jika OAuth masih Testing, tambahkan akun penguji di Audience → Test users.

Client Web tetap dipakai sebagai `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` di aplikasi
serta audience yang dipercaya backend. Android Client ID tidak ditempel ke
variabel tersebut. Pendaftaran package/SHA-1 harus selesai agar login berhasil.
Saat memakai Play App Signing atau sertifikat EAS lain, daftarkan SHA-1
sertifikat yang benar-benar menandatangani aplikasi tersebut juga.

Referensi:
- https://react-native-google-signin.github.io/docs/setting-up/get-config-file
- https://docs.expo.dev/guides/local-app-production/

## Build lokal

Prasyarat: Node sesuai Expo SDK, Java 21, Android SDK/NDK dan Gradle yang diminta
proyek. Build pertama dapat mengunduh komponen SDK/Gradle tambahan.

```bash
npm ci
export ANDROID_HOME=/path/to/Android/Sdk
export EXPO_PUBLIC_API_BASE_URL=https://pickme.nekomik.web.id
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=WEB_CLIENT_ID_DARI_PROJECT_PICKME_508408
export PICKME_BUILD_DIR=/tmp/pickme-android-build-new
npm run build:android
```

`PICKME_BUILD_DIR` harus kosong. Script menyalin source, membuat direktori native
melalui Expo prebuild, lalu menjalankan `assembleRelease` untuk `arm64-v8a`
dengan satu worker. Hasil disalin ke `releases/pickme-1.0.0-arm64.apk`.

Signing dibaca dari `.credentials/android.json` (atau path yang ditentukan
`PICKME_ANDROID_CREDENTIALS`), dengan field `keystorePath`, `keyAlias`,
`storePassword`, `keyPassword`. Keystore dan password **tidak masuk Git**.
Simpan backup folder `.credentials` secara privat; update aplikasi yang sudah
terinstal harus memakai signing key yang sama dan versionCode yang lebih besar.
Sertifikat ini bukan debug keystore bawaan Android.

## Peta native

Native memakai Leaflet dalam WebView dengan JS/CSS yang dibundel dari dependency
`leaflet`, bukan diunduh dari CDN saat aplikasi dibuka. Tile memakai OpenStreetMap
seperti versi web. Tidak diperlukan Google Maps API key. Lokasi dan pemilihan
marker terhubung melalui bridge JSON; token login tidak dikirim ke WebView.
Jalankan `npm run bundle:map` jika versi Leaflet diperbarui; lisensinya tersimpan
pada `assets/licenses/Leaflet.txt`. Tile/foto/API tetap memerlukan internet.

## Batas build

- Login Google memerlukan Google Play Services dan OAuth Android yang terdaftar.
- Public Profile dan Push Notifications tetap nonaktif: backend profil publik dan
  pengiriman push belum diimplementasikan.
- Build iOS memerlukan konfigurasi OAuth iOS tersendiri, Apple signing, dan
  toolchain macOS/EAS. `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` disediakan untuk itu.
- Hasil build dan pengujian perangkat dicatat setelah kompilasi selesai; export
  JavaScript saja tidak dianggap sebagai APK yang berhasil dibangun.

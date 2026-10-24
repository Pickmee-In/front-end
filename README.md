# PickMe Frontend

Frontend Expo berada di [`expo/`](expo/). Kode Flutter yang sudah ada di repo tetap tersedia di root. Acuan visual Expo
adalah folder `front-end` pada workspace pengembangan, commit `c7b20c6`,
seperti dicatat dalam panduan kesamaan tampilan.

- Website: https://pickme.nekomik.web.id
- [Unduh APK Android 1.0.0 ARM64](https://pickme.nekomik.web.id/downloads/pickme-1.0.0-arm64.apk) — Android 7.0 ke atas; build dan signature sudah diverifikasi, pengujian perangkat belum dilakukan.
- [Setup Expo dan environment FE/BE](expo/README.md)
- [Acuan kesamaan tampilan Flutter → Expo](expo/UI_PARITY.md)

## Expo

```bash
cd expo
npm ci
cp .env.example .env
# Isi URL API dan Google Web Client ID.
npm run web
```

Build web: `npx expo export --platform web` dari `expo/`. Login Google web sudah
terintegrasi. Login Android memakai Google Sign-In dan memerlukan pendaftaran
package/SHA-1 serta Web Client ID dari project Google Cloud yang sama.
Lihat [panduan APK Android](expo/ANDROID_BUILD.md).

## Flutter

Source Flutter asli berada di `lib/`, dengan konfigurasi `pubspec.yaml`.
Jalankan `flutter pub get` dan `flutter run` dari root untuk mengembangkan versi
Flutter. Detail source referensi Expo dicatat di `expo/UI_PARITY.md`; isi root repo ini
bukan snapshot lengkap dari referensi workspace tersebut.

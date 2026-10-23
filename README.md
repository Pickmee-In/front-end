# PickMe Frontend

Frontend Expo berada di [`expo/`](expo/). Kode Flutter yang sudah ada di repo tetap tersedia di root. Acuan visual Expo
adalah folder `front-end` pada workspace pengembangan, commit `c7b20c6`,
seperti dicatat dalam panduan kesamaan tampilan.

- Website: https://pickme.nekomik.web.id
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
terintegrasi; login Google native masih memerlukan integrasi terpisah.

## Flutter

Source Flutter asli berada di `lib/`, dengan konfigurasi `pubspec.yaml`.
Jalankan `flutter pub get` dan `flutter run` dari root untuk mengembangkan versi
Flutter. Detail source referensi Expo dicatat di `expo/UI_PARITY.md`; isi root repo ini
bukan snapshot lengkap dari referensi workspace tersebut.

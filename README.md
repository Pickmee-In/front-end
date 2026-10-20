# PickMe Frontend

Frontend Expo berada di [`expo/`](expo/). Kode Flutter lama tetap tersedia di root
sebagai acuan tampilan dan implementasi sebelumnya.

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
Flutter. Implementasi Expo mengikuti tata letak, warna, dan komponen layar ini.

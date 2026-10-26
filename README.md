# PickMe — Expo

Frontend aktif ada di `expo/` pada repo GitHub (folder `front-end-rn` di workspace pengembangan). Aplikasi Flutter lama tetap disimpan di root repo GitHub.
Versi yang terpasang saat panduan ini diperbarui: Expo SDK 58.0.14, React Native
0.88.0, React 19.3.0, dan Expo Router 58.0.23. Ikuti `package-lock.json` untuk
versi dependensi yang konsisten.

APK Android: [PickMe 1.0.0 ARM64](https://pickme.nekomik.web.id/downloads/pickme-1.0.0-arm64.apk)
untuk Android 7.0 ke atas. Detail verifikasi dan batas pengujian ada di
[panduan build Android](ANDROID_BUILD.md#release-terverifikasi--24-oktober-2026).

## Menjalankan frontend

```bash
cd expo
npm ci
cp .env.example .env
# Edit .env sesuai perangkat yang digunakan.
npm start
```

Gunakan development build untuk native karena Google Sign-In memakai modul native
yang tidak tersedia di Expo Go.
Untuk browser, jalankan `npm run web`.

## Environment frontend

| Variabel                           | Kegunaan                                               | Status                                                     |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`         | Root URL backend, tanpa `/api`                         | Perlu disesuaikan; fallback `http://localhost:3000`        |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth Web Client ID, sama dengan `GOOGLE_CLIENT_ID` BE | Wajib untuk Google Login web dan Android |

Expo CLI otomatis membaca `.env`. Kode menggunakan akses langsung
`process.env.EXPO_PUBLIC_API_BASE_URL` agar nilainya masuk ke bundle. Tidak perlu
menambah `react-native-dotenv`. Setelah mengubah env, lakukan full reload aplikasi;
jika masih memakai nilai lama, restart dengan `npx expo start --clear`.

Semua `EXPO_PUBLIC_*` dapat dibaca dari aplikasi. `DATABASE_URL`, JWT secret,
Vercel Blob token, dan Gemini API key hanya boleh ada di BE.

Referensi: [Environment variables in Expo](https://docs.expo.dev/guides/environment-variables/).

## URL sesuai perangkat

| Perangkat FE                                  | `EXPO_PUBLIC_API_BASE_URL`  |
| --------------------------------------------- | --------------------------- |
| Web di laptop BE / iOS Simulator pada host BE | `http://localhost:3000`     |
| Android Studio Emulator                       | `http://10.0.2.2:3000`      |
| HP fisik / Expo Go                            | `http://IP_LAN_LAPTOP:3000` |
| Production                                    | `https://api.domainmu.com`  |

Untuk HP fisik, laptop dan HP harus berada pada jaringan yang saling terhubung,
dan port BE harus dapat diakses. Isi `APP_URL` BE dengan URL yang dapat dijangkau
HP juga, karena BE memakainya untuk URL gambar relatif. Jangan memakai
`localhost` pada HP: alamat itu menunjuk HP sendiri.

`FRONTEND_URL` BE adalah origin **Expo Web**, misalnya `http://localhost:8081`
atau `http://192.168.1.10:8081` jika web dibuka lewat IP LAN. Ini bukan URL API,
bukan URL `exp://`, dan saat ini hanya mendukung satu origin yang dikonfigurasi.
Request native tanpa Origin diizinkan oleh CORS BE. Tunnel Metro tidak otomatis
membuat server BE bisa diakses dari internet.

## Menjalankan backend

Dari root workspace:

```bash
cd back-end
npm install
cp .env.example .env
# Isi DATABASE_URL, JWT secrets, Google Client ID, dan token fitur yang digunakan.
# Untuk database development baru:
npm run db:push
npm run dev
```

`db:push` menyinkronkan schema dan dapat mengubah database, jadi arahkan ke database
development. Endpoint pemeriksaan server: `GET http://localhost:3000/health`.
`/health` hanya memeriksa proses server, bukan koneksi database atau kredensial.

## Environment backend

| Variabel                                     | Kegunaan / kebutuhan                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                               | Wajib saat startup; connection string PostgreSQL lokal/VPS atau provider hosted; driver `node-postgres`.                              |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`           | Isi dua secret acak berbeda untuk access/refresh token. Kode memiliki fallback development; jangan gunakan fallback untuk deployment. |
| `GOOGLE_CLIENT_ID`                           | OAuth Web Client ID untuk verifikasi audience Google token; harus sesuai dengan client FE.                                            |
| `GOOGLE_CLIENT_IDS`                          | Opsional, audience OAuth tambahan yang diizinkan, dipisahkan koma.                                                                    |
| `BLOB_READ_WRITE_TOKEN`                      | Diperlukan hanya saat `STORAGE_PROVIDER=blob`. VPS memakai storage lokal.                                                             |
| `STORAGE_PROVIDER`, `UPLOAD_DIR`             | `local` untuk filesystem VPS; `blob` untuk Vercel Blob. Path upload harus persisten.                                                  |
| `APP_URL`                                    | URL publik/LAN BE untuk URL file relatif; default `http://localhost:3000`.                                                            |
| `PORT`, `NODE_ENV`                           | Default `3000`, `0.0.0.0`, dan `development`; gunakan `production` saat deploy.                                                       |
| `FRONTEND_URL`                               | Origin web untuk CORS; default `http://localhost:8081`.                                                                               |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`   | Default `1h` dan `7d`.                                                                                                                |
| `GEMINI_API_KEY`                             | Opsional untuk analisis foto; jika kosong, metadata diisi manual.                                                                     |
| `GEMINI_MODEL`                               | Model analisis; default `gemini-3.5-flash-lite`.                                                                                      |
| `GOOGLE_PLACES_API_KEY`                      | Tersedia di config, belum dipakai service. Tidak perlu diisi saat ini.                                                                |
| `ANTIVIRUS_ENABLED`                          | Opsional, default `false`.                                                                                                            |
| `ANTIVIRUS_SCAN_URL`, `ANTIVIRUS_TIMEOUT_MS` | URL scanner jika antivirus aktif; timeout default `7000` ms.                                                                          |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`     | Default `60000` ms / `300` request.                                                                                                   |

Untuk membuat JWT secret, jalankan perintah ini **dua kali**, lalu simpan masing-masing
hasilnya ke variabel yang berbeda di `.env` BE:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Status integrasi

- Tampilan mengikuti Flutter lama: beranda swipe, drawer filter, navigasi empat tab,
  tombol tambah tengah, peta Explore, profil gradasi, dan form upload.
  Lihat [pemetaan acuan UI](UI_PARITY.md). Pilihan kartu baru dihapus setelah BE
  menerima aksi; kegagalan menyimpan menampilkan pesan dan mengembalikan kartu.
- Expo Web menggunakan Google Identity Services di `app/(auth)/login.web.tsx`.
  ID token ditukar ke BE dan sesi memperbarui navigasi root. Tambahkan origin web
  ke Authorized JavaScript origins Google Cloud; jika OAuth masih Testing,
  tambahkan akun login ke test users. Client secret tidak digunakan oleh alur ini.
- Login native (`login.tsx`) terhubung ke Google Sign-In dan API. Package/SHA-1
  APK harus didaftarkan di Google Cloud; lihat [build Android](ANDROID_BUILD.md).
- Peta native memakai Leaflet/OpenStreetMap dalam WebView dengan kode yang dibundel.
  Google Maps SDK/API key tidak diperlukan.

## Pemeriksaan lokal

```bash
npx tsc --noEmit
npx expo export --platform web
```

Untuk EAS Build/Update, atur variabel FE pada environment EAS yang sesuai dengan
build/update. Jangan mengandalkan `.env` lokal yang tidak ikut dikirim ke EAS.
Lihat [Environment variables in EAS](https://docs.expo.dev/eas/environment-variables/).

## Production VPS

- Website dan API: `https://pickme.nekomik.web.id` (API pada `/api`).
- Di repo GitHub `Pickmee-In/front-end`, Expo berada di folder `expo/`;
  perintah setup dijalankan dari folder itu.
- Env FE produksi: `EXPO_PUBLIC_API_BASE_URL=https://pickme.nekomik.web.id`
  dan OAuth Web Client ID di `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
- Build: `npx expo export --platform web`; salin hasil `dist/` ke
  `/var/www/pickme/frontend`. Nginx memakai fallback `index.html` untuk route Expo.
- Server config dan env BE disimpan di `/var/www/pickme`; secret tidak ada di Git.

## APK Android

Lihat [panduan build APK dan konfigurasi Google Android](ANDROID_BUILD.md).

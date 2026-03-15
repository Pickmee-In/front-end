# Google Auth Setup (PickMe)

Dokumen ini untuk setup login **Google-only** pada frontend Flutter + backend Express.

## 1) Google Cloud Console

1. Buat / pilih project di Google Cloud Console.
2. Configure **OAuth consent screen**.
3. Buat OAuth Client IDs:
   - **Web application** → dipakai backend verifikasi `idToken`.
   - **Android** → isi package name + SHA-1.
   - **iOS** → isi Bundle ID.

Simpan nilai berikut:
- `WEB_CLIENT_ID` (format: `xxx.apps.googleusercontent.com`)

## Kenapa backend pakai Web Client ID?

Karena backend memverifikasi `idToken` dari Google. Nilai `aud` di token untuk server-side verification harus cocok dengan **Web OAuth Client ID**.

Jadi:
- Backend (`GOOGLE_CLIENT_ID`) = **Web Client ID**
- Frontend `GOOGLE_SERVER_CLIENT_ID` = **Web Client ID** (supaya `idToken` bisa didapat dan valid untuk backend)

## Apakah Android OAuth Client tetap perlu?

**Iya, tetap perlu dibuat** di Google Cloud:
- Tipe: **Android**
- Isi: package name + SHA-1 (debug & release)

Android client dipakai untuk identitas aplikasi Android di sisi Google Sign-In. Namun untuk verifikasi backend tetap pakai **Web Client ID**.

## Perlu `google-services.json`?

Untuk arsitektur saat ini (**google_sign_in + backend verify idToken**, tanpa Firebase Auth),
**tidak wajib** menaruh `google-services.json`.

`google-services.json` biasanya wajib jika memakai Firebase SDK (mis. Firebase Auth/Analytics/Crashlytics).

## 2) Backend Setup

File: `.env`

```env
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID
```

Lalu jalankan backend:

```bash
npm install
npm run dev
```

Backend endpoint auth yang dipakai frontend:
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## 3) Frontend Setup

Dependensi auth sudah ditambahkan:
- `google_sign_in`
- `http`
- `flutter_secure_storage`

Jalankan:

```bash
flutter pub get
```

## 4) Jalankan App dengan Dart Define

Frontend membaca konfigurasi dari `--dart-define`:
- `API_BASE_URL`
- `GOOGLE_SERVER_CLIENT_ID`

Contoh (Linux desktop):

```bash
flutter run \
  --dart-define=API_BASE_URL=http://localhost:3000 \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=YOUR_WEB_CLIENT_ID
```

Contoh (Android Emulator):

```bash
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000 \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=YOUR_WEB_CLIENT_ID
```

## 5) Catatan Penting

- Login/register email-password sudah dinonaktifkan di backend route.
- Frontend flow login/register sekarang hanya via Google.
- Jika muncul error `Google ID token not available`, cek nilai `GOOGLE_SERVER_CLIENT_ID` dan OAuth Client ID di Google Cloud.

## 6) Troubleshooting Android (Paling sering)

### A. Sign-in popup muncul lalu langsung tertutup

Biasanya Android OAuth belum cocok.

Cek:
1. Package name harus sama persis dengan app:
  - Saat ini: `com.example.front_end`
   - Lokasi: `android/app/build.gradle.kts`
2. SHA-1 debug sudah didaftarkan di Android OAuth Client.
3. `GOOGLE_SERVER_CLIENT_ID` pakai **Web Client ID**.

Nilai yang sudah berhasil diambil dari workspace ini:

- Package name: `com.example.front_end`
- Debug SHA-1: `96:43:90:B7:22:6D:C9:8F:B0:36:AE:F2:18:6D:28:BF:23:06:44:13`

Perintah ambil SHA-1 debug (Linux):

```bash
cd android
./gradlew signingReport
```

Ambil SHA1 dari variant `debug` lalu masukkan ke Android OAuth Client.

> Untuk rilis Play Store nanti, tambahkan juga SHA-1 release/upload ke OAuth Android client yang sama (atau buat client terpisah).

### B. Sign-in sukses tapi app tetap error network

Biasanya `API_BASE_URL` salah.

- Android Emulator harus pakai host machine via `10.0.2.2`:

```bash
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000 \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=YOUR_WEB_CLIENT_ID
```

- Jika pakai device fisik, gunakan IP LAN komputer (bukan `localhost`).

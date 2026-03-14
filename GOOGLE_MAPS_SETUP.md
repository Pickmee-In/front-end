# Setup Google Maps untuk PickMe App

Map tidak muncul karena **Google Maps API Key belum dikonfigurasi**. Ikuti langkah-langkah berikut:

## Step 1: Dapatkan Google Maps API Key

1. **Buka Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Buat Project Baru (jika belum ada):**
   - Klik "Select a Project" → "New Project"
   - Isi nama project: "PickMe" (atau sesuai keinginan)
   - Klik "Create"

3. **Enable Maps APIs:**
   - Di dashboard, cari "APIs & Services"
   - Klik "Enable APIs and Services"
   - Cari dan enable:
     - **Maps SDK for Android**
     - **Maps SDK for iOS**

4. **Buat API Key:**
   - Ke "Credentials" (di sidebar)
   - Klik "Create Credentials" → "API Key"
   - Copy API Key yang dihasilkan

## Step 2: Konfigurasi di Android

**File:** `android/app/src/main/AndroidManifest.xml`

Cari baris:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE" />
```

Ganti dengan:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_ACTUAL_API_KEY_HERE" />
```

Contoh (jangan gunakan, ini tidak valid):
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="AIzaSyDvG35__7HygYo_5Qyj6rkR2OHmRjqwKFA" />
```

## Step 3: Konfigurasi di iOS

**File:** `ios/Runner/Info.plist`

Cari baris:
```xml
<key>GoogleMapsAPIKey</key>
<string>YOUR_GOOGLE_MAPS_API_KEY_HERE</string>
```

Ganti dengan:
```xml
<key>GoogleMapsAPIKey</key>
<string>YOUR_ACTUAL_API_KEY_HERE</string>
```

## Step 4: Rebuild App

```bash
cd /Users/user/development/project/Lomba/front-end

# Clean build
flutter clean

# Get dependencies
flutter pub get

# Run app
flutter run
```

## Troubleshooting

### Map masih tidak muncul
- Pastikan API Key sudah benar (copas langsung dari Console jangan ada space)
- Tunggu 5 menit setelah enable APIs (propagasi key bisa lambat)
- Rebuild app: `flutter clean && flutter pub get && flutter run`

### API Key Error
- Pastikan Maps SDK for Android dan iOS sudah di-enable
- Download service account JSON jika diperlukan

### Billing Required
- Google Maps API memerlukan billing account untuk produksi
- Setup di Google Cloud Console → Billing

## Dokumentasi Resmi
- [Google Maps Flutter Plugin](https://pub.dev/packages/google_maps_flutter)
- [Google Cloud Setup Guide](https://cloud.google.com/docs/authentication/getting-started)

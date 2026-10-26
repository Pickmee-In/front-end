# Acuan tampilan PickMe

Expo mengikuti source Flutter di folder `front-end` workspace pada commit
`c7b20c6`. Flutter tersebut dipertahankan sebagai referensi. Nilai ukuran,
warna, teks, dan posisi komponen diambil dari layar yang aktif, termasuk export
`explore_screen.dart` ke `pages/explore_page.dart`.

| Layar                    | Referensi Flutter                  | Implementasi Expo                                            |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------ |
| Onboarding               | `pages/onboarding_page.dart`       | `app/(auth)/onboarding.tsx`                                  |
| Login Google             | `pages/login_page.dart`            | `app/(auth)/login.web.tsx`, `login.tsx`                      |
| Home / swipe + filter    | `pages/discover_items_page.dart`   | `app/(tabs)/index.tsx`                                       |
| Navigasi + tombol tambah | `screens/home_screen.dart`         | `app/(tabs)/_layout.tsx`                                     |
| Peta Explore             | `pages/explore_page.dart`          | `src/screens/ExploreScreen.tsx`, `src/components/MapCanvas*` |
| Chat                     | `pages/chat_page.dart`             | `app/(tabs)/chat.tsx`                                        |
| Profil                   | `screens/profile_screen.dart`      | `app/(tabs)/profile.tsx`                                     |
| Edit profil              | `screens/edit_profile_screen.dart` | `app/edit-profile.tsx`                                       |
| Upload                   | `pages/upload_item_page.dart`      | `app/upload.tsx`                                             |
| Edit item                | `screens/edit_item_page.dart`      | `app/edit-item.tsx`                                          |
| Notifikasi               | `pages/notifications_page.dart`    | `app/notifications.tsx`                                      |

Detail yang dipertahankan: sky blue `#8CE4FF`, gradasi `#44CCFF`, font Roboto yang benar-benar dirender Flutter lama, ikon Material asli, kartu swipe radius 28 dan margin 20, drawer filter kiri,
empat tab dengan tombol tambah di tengah, profil gradasi biru, serta susunan
form upload dengan dropdown dan pilihan Free/Bayar. Explore web memakai tile
OpenStreetMap yang sama dengan Flutter; data item tetap berasal dari API.

## Verifikasi visual 21–23 Oktober 2026

Salinan Flutter dibangun dengan SDK lokal 3.38.5 menggunakan widget asli dan
pembuka halaman khusus pengujian. Source referensi tidak diubah. Screenshot
Flutter dan Expo diambil pada viewport 390×844 dengan fixture API yang sama.
Perbandingan mencakup onboarding, login, home, profil, edit profil, upload,
chat, detail chat, dan notifikasi. Screenshot diperbarui pada 23 Oktober.
Buka [perbandingan berdampingan dan overlay](docs/visual-review/index.html) di
browser lokal untuk memeriksa hasilnya. Tidak ada klaim persentase kesamaan piksel.

Temuan penting: `pubspec.yaml` Flutter tidak membundel Plus Jakarta Sans.
FontManifest dan request browser menunjukkan Roboto yang dimuat sebagai fallback.
Expo kini membundel file Roboto yang sama; font ikon Material juga diambil dari
SDK Flutter yang dipakai untuk render referensi, termasuk varian rounded.
Lisensi kedua font tersedia di `assets/fonts/`.

Penyempurnaan: splash 2,2 detik, tinggi tab mengikuti render Flutter, metrik teks,
jarak avatar/input, dialog Add Tag, kartu item pada chat, timestamp di dalam balon,
baris notifikasi, sumber foto Camera/Gallery dan ukuran dropdown upload,
serta marker foto dengan animasi 700 ms. Animasi menghormati
pengaturan reduced motion. Peta menggunakan tile OpenStreetMap di web dan native.

Minat disimpan melalui `users.preferences.interests`, digabung dengan preferensi
lain. Penyimpanan diuji lewat API VPS dengan akun uji sementara lalu dibersihkan.

## Batas verifikasi dan perbedaan yang disengaja

- Tombol Google web tetap memakai Google Identity Services; login native kini
  memakai Google Sign-In; aktivasi membutuhkan OAuth package/SHA-1 Android.
- Public Profile dan Push Notifications ditampilkan nonaktif dengan keterangan
  “Segera tersedia”. Layanan profil publik dan pengiriman push belum tersedia;
  kontrol tersebut tidak berpura-pura menerapkan privasi atau mengaktifkan push.
- Rasterisasi font, emoji, shadow, keyboard, dan safe area dapat berbeda di perangkat.
  Pemeriksaan visual dilakukan di browser; APK release Android berhasil dibangun
  dan diverifikasi pada 24 Oktober 2026, tetapi belum diuji
  langsung pada perangkat Android/iOS.
- Data pengguna asli tetap dipakai di production; foto/default user fixture hanya
  dipakai pada screenshot pembanding.

Pemeriksaan: TypeScript, export web dan Android, tes browser viewport 390×844,
320×568, dan 1440×900; filter/swipe termasuk gagal-simpan, pencarian peta, tab,
minat/profil, tutorial, validasi upload, serta kirim pesan dan kegagalan jaringan.

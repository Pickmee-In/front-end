# Acuan tampilan PickMe

Expo mengikuti source Flutter di folder `front-end` workspace (root repo GitHub
`Pickmee-In/front-end`). Flutter tetap disimpan sebagai referensi. Nilai ukuran,
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

Detail yang dipertahankan: sky blue `#8CE4FF`, gradasi `#44CCFF`, font Plus Jakarta
Sans, ikon Material, kartu swipe radius 28 dan margin 20, drawer filter kiri,
empat tab dengan tombol tambah di tengah, profil gradasi biru, serta susunan
form upload dengan dropdown dan pilihan Free/Bayar. Explore web memakai tile
OpenStreetMap yang sama dengan Flutter; data item tetap berasal dari API.

Perbedaan platform yang masih ada:

- Tombol Google web dirender oleh Google Identity Services; bentuknya mengikuti
  komponen Google. Login native masih belum diintegrasikan.
- Peta native memakai `react-native-maps`; tampilan peta dasar bergantung platform.
- Shadow, teks, safe area, dan kontrol input bisa sedikit berbeda antar browser
  dan perangkat. Kesamaan piksel dengan screenshot Flutter belum diukur.
- Tag/minat dan toggle privasi pada edit profil Flutter belum memiliki penyimpanan
  API; layar Expo hanya menampilkan field profil yang benar-benar tersimpan.

Validasi: TypeScript, export Expo Web, screenshot browser pada viewport 390×844,
320×568, dan 1440×900; interaksi filter, swipe, pencarian peta, navigasi tab,
penyimpanan profil, tutorial, dan validasi upload diuji dengan respons API fixture.

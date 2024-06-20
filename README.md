# Markir RESTful API

Markir RESTful API menyediakan layanan untuk mendeteksi dan memprediksi ketersediaan tempat parkir serta menyimpan data tersebut ke dalam database secara real-time. API ini beroperasi di Google Cloud Platform (GCP) dan berinteraksi dengan Cloud SQL Database untuk menyimpan dan mengambil data parkir.

## Fitur Utama

- **Deteksi Tempat Parkir:** Memotong gambar parkiran dan memprediksi apakah slot parkir terisi atau tidak.
- **Pengiriman Data Real-Time:** Mengirim data setiap 5 detik ke Cloud SQL Database.
- **Integrasi dengan Aplikasi Mobile:** Menyediakan endpoint untuk diakses oleh aplikasi seluler untuk memperbarui data secara real-time.


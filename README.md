# DevTools

Kumpulan tools berbasis web untuk membantu produktivitas pengembang sehari-hari — mulai dari formatting, encoding, generating, hingga debugging CSS. Semua tersedia dalam satu platform tanpa perlu berpindah-pindah tab atau aplikasi.

## Fitur

### Format & Validasi

| Tool | Deskripsi |
|---|---|
| **JSON Formatter** | Format (pretty-print), minify, dan validasi JSON. Menampilkan pesan error yang jelas jika JSON tidak valid. |
| **JS / TS Formatter** | Format, minify, dan validasi kode JavaScript atau TypeScript menggunakan Prettier. Dilengkapi toggle untuk beralih antar sintaks. |
| **HTML Formatter** | Format, minify, dan validasi kode HTML menggunakan Prettier. |
| **CSS / SCSS / SASS Formatter** | Format, minify, dan validasi kode CSS, SCSS, atau SASS menggunakan Prettier. Dilengkapi toggle untuk beralih antar sintaks. |

### Encoding

| Tool | Deskripsi |
|---|---|
| **Base64** | Encode dan decode teks ke/dari format Base64. Dilengkapi tombol Swap untuk membalik input dan output. |
| **URL Encode/Decode** | Encode dan decode string menggunakan `encodeURIComponent` / `decodeURIComponent`. |
| **HTML Entities** | Encode karakter khusus HTML (`<`, `>`, `&`, dll.) dan decode kembali ke teks biasa. |
| **JWT Decoder** | Decode token JWT menjadi Header dan Payload yang terbaca. Timestamp `exp`, `iat`, `nbf` otomatis dikonversi ke tanggal, serta badge status expired. |
| **Hash Generator** | Generate hash menggunakan algoritma SHA-1, SHA-256, SHA-384, dan SHA-512 via Web Crypto API. |

### Text

| Tool | Deskripsi |
|---|---|
| **Diff Checker** | Bandingkan dua teks baris per baris menggunakan algoritma LCS (Longest Common Subsequence). Menampilkan baris ditambah (hijau) dan dihapus (merah) beserta nomor baris. |
| **Case Converter** | Konversi teks ke 8 format sekaligus: `camelCase`, `PascalCase`, `snake_case`, `kebab-case`, `SCREAMING_SNAKE`, `Title Case`, `lowercase`, `UPPERCASE`. |
| **Regex Tester** | Uji regex secara live dengan highlight match pada teks. Mendukung toggle flag (`g`, `i`, `m`, `s`), menampilkan detail setiap match beserta capture groups. |

### Generator

| Tool | Deskripsi |
|---|---|
| **UUID Generator** | Generate UUID versi v1 (time-based), v4 (random), atau v7 (time-ordered) secara bulk hingga 100 UUID sekaligus. Salin satu per satu atau semua sekaligus. |
| **Lorem Ipsum** | Generate placeholder text dalam satuan kata, kalimat, atau paragraf dengan jumlah yang bisa dikustomisasi. |
| **Password Generator** | Generate password aman dengan opsi panjang (4–128 karakter), pilihan charset (huruf besar, huruf kecil, angka, simbol), dan indikator kekuatan password. |

### Frontend / CSS

| Tool | Deskripsi |
|---|---|
| **Color Converter** | Konversi warna antar format HEX, RGB, dan HSL secara dua arah. Dilengkapi color picker native dan preview warna. |
| **PX → REM** | Konversi nilai PX ke REM dan sebaliknya dengan base font size yang bisa dikustomisasi (default 16px). Tersedia tabel referensi untuk nilai-nilai umum. |

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **UI Components** — [shadcn/ui](https://ui.shadcn.com)
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com)
- **Icons** — [Tabler Icons](https://tabler.io/icons)
- **Code Formatter** — [Prettier](https://prettier.io) (dijalankan di browser via standalone build)
- **Theme** — Dark/Light mode via [next-themes](https://github.com/pacocoursey/next-themes)
- **Language** — TypeScript

## Memulai

### Prasyarat

- Node.js 18+
- npm / yarn / pnpm

### Instalasi

```bash
# Clone repository
git clone <repo-url>
cd dev-tools-app

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Scripts

```bash
npm run dev        # Jalankan development server
npm run build      # Build untuk production
npm run start      # Jalankan production build
npm run typecheck  # Type checking TypeScript
npm run lint       # Linting
npm run format     # Format kode dengan Prettier
```

## Struktur Proyek

```
dev-tools-app/
├── app/
│   ├── page.tsx                  # Halaman home (daftar semua tools)
│   ├── layout.tsx                # Root layout (sidebar + header)
│   └── tools/
│       ├── json-formatter/
│       ├── js-formatter/
│       ├── html-formatter/
│       ├── css-formatter/
│       ├── base64/
│       ├── url-encode/
│       ├── html-entities/
│       ├── jwt-decoder/
│       ├── hash-generator/
│       ├── diff-checker/
│       ├── case-converter/
│       ├── regex-tester/
│       ├── uuid-generator/
│       ├── lorem-ipsum/
│       ├── password-generator/
│       ├── color-converter/
│       └── px-rem/
├── components/
│   ├── layouts/
│   │   ├── app-sidebar.tsx       # Sidebar navigasi
│   │   ├── site-header.tsx       # Header dengan judul halaman & toggle theme
│   │   └── nav-*.tsx
│   └── ui/                       # shadcn/ui components
├── config/
│   └── nav.ts                    # Sumber data navigasi (nav groups + title map)
└── lib/
    └── utils.ts
```

## Menambah Tool Baru

Cukup dua langkah:

1. Buat folder dan `page.tsx` di `app/tools/<nama-tool>/`
2. Tambahkan entry di `config/nav.ts` — sidebar, header, dan home page otomatis terupdate

```ts
// config/nav.ts
{
  label: "Kategori",
  items: [
    { title: "Nama Tool", url: "/tools/nama-tool", icon: IconNama },
  ],
}
```

## Lisensi

MIT

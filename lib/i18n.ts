export type Language = "en" | "id"

export const translations = {
  en: {
    // Navigation
    navHome: "Home",

    // Home page
    homeTitle: "All Tools",
    homeSubtitle:
      "A collection of tools to help with daily coding and debugging.",

    // Common
    clear: "Clear",
    copy: "Copy",
    copied: "Copied!",
    format: "Format",
    minify: "Minify",
    validate: "Validate",
    encode: "Encode",
    decode: "Decode",
    swap: "Swap ↕",
    generate: "Generate",
    formatting: "Formatting...",
    outputPlaceholder: "Output will appear here...",
    copyAll: "Copy All",

    // Base64
    base64InputPlaceholder: "Enter text or Base64 string...",
    base64EncodeError: "Failed to encode text. Check your input.",
    base64DecodeError: "Input is not valid Base64.",

    // URL Encode
    urlEncodeInputPlaceholder: "Enter text or URL encoded string...",
    urlEncodeError: "Failed to encode URL.",
    urlDecodeError: "Input is not valid URL encoded.",

    // HTML Entities
    htmlEntitiesEncodeExample: "Encode example",
    htmlEntitiesDecodeExample: "Decode example",
    htmlEntitiesDecodeError: "Failed to decode HTML entities.",

    // JWT
    jwtInvalidError:
      "Invalid JWT token. Must have 3 parts (header.payload.signature).",
    jwtValid: "Valid (unverified)",
    jwtExpired: "Expired",

    // Hash Generator
    hashInputPlaceholder: "Enter text to hash...",
    hashAlgorithm: "Algorithm",
    hashComputing: "Computing...",
    hashGenerateBtn: "Generate Hash",

    // Password Generator
    passwordLength: "Password Length",
    passwordUppercase: "Uppercase (A-Z)",
    passwordLowercase: "Lowercase (a-z)",
    passwordNumbers: "Numbers (0-9)",
    passwordSymbols: "Symbols (!@#$...)",
    passwordSelectMin: "Select at least one character type.",
    passwordStrength: "Strength",
    passwordWeak: "Weak",
    passwordMedium: "Medium",
    passwordStrong: "Strong",
    passwordVeryStrong: "Very Strong",
    passwordGenerateBtn: "Generate Password",

    // UUID Generator
    uuidVersion: "Version",
    uuidCount: "Count",
    uuidEmptyState: "Click Generate to create UUIDs",

    // Lorem Ipsum
    loremCount: "Count",
    loremUnit: "Unit",
    loremWords: "Words",
    loremSentences: "Sentences",
    loremParagraphs: "Paragraphs",
    loremWordCountUnit: "words",
    loremEmptyState: "Click Generate to create Lorem Ipsum text",

    // Diff Checker
    diffFirstPlaceholder: "First text...",
    diffSecondPlaceholder: "Second text...",

    // Case Converter
    caseEmptyState: "Enter text to see conversions",

    // Regex Tester
    regexInvalid: "Invalid regex",
    regexTestPlaceholder: "Enter text to test...",

    // PX → REM
    pxRemReferenceTable: "Reference Table",

    // Color Converter
    colorPickerHint: "Click to pick a color",

    // JS/TS Formatter
    jsInputPlaceholder: "// Paste your JavaScript code here...",
    tsInputPlaceholder: "// Paste your TypeScript code here...",

    // CSS Formatter
    cssInputPlaceholder: "/* Paste your CSS here... */",
    scssInputPlaceholder: "// Paste your SCSS here...",
    sassInputPlaceholder: "// Paste your SASS here...",

    // HTML Formatter
    htmlInputPlaceholder: "<!-- Paste your HTML here... -->",

    // SQL Formatter
    sqlInputPlaceholder: "-- Paste your SQL query here...",

    // Cryptography common
    cryptoKey: "Key / Passphrase",
    cryptoKeyPlaceholder: "Enter secret key...",
    cryptoEncrypt: "Encrypt",
    cryptoDecrypt: "Decrypt",
    cryptoDecryptError: "Decryption failed. Wrong key or invalid ciphertext.",

    // AES
    aesInputPlaceholder: "Plaintext to encrypt, or Base64 ciphertext to decrypt...",

    // DES
    desInputPlaceholder: "Plaintext to encrypt, or Base64 ciphertext to decrypt...",

    // RC4
    rc4InputPlaceholder: "Plaintext to encrypt, or Base64 ciphertext to decrypt...",

    // RSA
    rsaKeys: "Keys",
    rsaKeySize: "Key Size",
    rsaGenerate: "Generate Key Pair",
    rsaGenerating: "Generating...",
    rsaPublicKey: "Public Key",
    rsaPrivateKey: "Private Key",
    rsaNoKey: "No key — generate one in Keys tab",
    rsaPlaintextPlaceholder: "Enter plaintext to encrypt (max ~190 chars for 2048-bit)...",
    rsaCiphertextPlaceholder: "Paste Base64 ciphertext to decrypt...",

    // ECDSA
    ecdsaCurve: "Curve",
    ecdsaSign: "Sign",
    ecdsaVerify: "Verify",
    ecdsaMessage: "Message",
    ecdsaSignature: "Signature (Base64)",
    ecdsaValid: "✓ Signature is valid",
    ecdsaInvalid: "✗ Signature is invalid",
    ecdsaMessagePlaceholder: "Enter message to sign or verify...",
    ecdsaSignaturePlaceholder: "Paste Base64 signature...",

    // QR Generator
    qrInputLabel: "Text / URL",
    qrInputPlaceholder: "https://example.com",
    qrErrorLevel: "Error Correction",
    qrSize: "Size",
    qrDownload: "Download PNG",

    // Barcode Generator
    barcodeFormat: "Format",
    barcodeValue: "Value",
    barcodeInputPlaceholder: "Enter value to encode...",
    barcodeDownload: "Download SVG",

    // Tool Search
    searchPlaceholder: "Search tools...",
    searchDialogTitle: "Search Tools",
    searchDialogDesc: "Search and navigate to available tools",
    searchEmpty: "No tools found.",

    // Not Found
    notFoundTitle: "Page Not Found",
    notFoundDesc: "The page you are looking for does not exist.",
    notFoundGoHome: "Go to Home",
  },
  id: {
    // Navigation
    navHome: "Beranda",

    // Home page
    homeTitle: "Semua Tools",
    homeSubtitle:
      "Kumpulan tools untuk membantu coding dan debugging sehari-hari.",

    // Common
    clear: "Hapus",
    copy: "Salin",
    copied: "Disalin!",
    format: "Format",
    minify: "Minify",
    validate: "Validasi",
    encode: "Enkode",
    decode: "Dekode",
    swap: "Tukar ↕",
    generate: "Buat",
    formatting: "Memformat...",
    outputPlaceholder: "Output akan muncul di sini...",
    copyAll: "Salin Semua",

    // Base64
    base64InputPlaceholder: "Masukkan teks atau string Base64...",
    base64EncodeError: "Gagal mengencoding teks. Periksa input Anda.",
    base64DecodeError: "Input bukan Base64 yang valid.",

    // URL Encode
    urlEncodeInputPlaceholder: "Masukkan teks atau URL encoded string...",
    urlEncodeError: "Gagal mengencoding URL.",
    urlDecodeError: "Input bukan URL encoded yang valid.",

    // HTML Entities
    htmlEntitiesEncodeExample: "Contoh encode",
    htmlEntitiesDecodeExample: "Contoh decode",
    htmlEntitiesDecodeError: "Gagal mendecode HTML entities.",

    // JWT
    jwtInvalidError:
      "Token JWT tidak valid. Harus memiliki 3 bagian (header.payload.signature).",
    jwtValid: "Valid (tidak diverifikasi)",
    jwtExpired: "Kedaluwarsa",

    // Hash Generator
    hashInputPlaceholder: "Masukkan teks untuk di-hash...",
    hashAlgorithm: "Algoritma",
    hashComputing: "Menghitung...",
    hashGenerateBtn: "Buat Hash",

    // Password Generator
    passwordLength: "Panjang Password",
    passwordUppercase: "Huruf Besar (A-Z)",
    passwordLowercase: "Huruf Kecil (a-z)",
    passwordNumbers: "Angka (0-9)",
    passwordSymbols: "Simbol (!@#$...)",
    passwordSelectMin: "Pilih minimal satu jenis karakter.",
    passwordStrength: "Kekuatan",
    passwordWeak: "Lemah",
    passwordMedium: "Sedang",
    passwordStrong: "Kuat",
    passwordVeryStrong: "Sangat Kuat",
    passwordGenerateBtn: "Buat Password",

    // UUID Generator
    uuidVersion: "Versi",
    uuidCount: "Jumlah",
    uuidEmptyState: "Klik Generate untuk membuat UUID",

    // Lorem Ipsum
    loremCount: "Jumlah",
    loremUnit: "Satuan",
    loremWords: "Kata",
    loremSentences: "Kalimat",
    loremParagraphs: "Paragraf",
    loremWordCountUnit: "kata",
    loremEmptyState: "Klik Generate untuk membuat teks Lorem Ipsum",

    // Diff Checker
    diffFirstPlaceholder: "Teks pertama...",
    diffSecondPlaceholder: "Teks kedua...",

    // Case Converter
    caseEmptyState: "Masukkan teks untuk melihat konversi",

    // Regex Tester
    regexInvalid: "Regex tidak valid",
    regexTestPlaceholder: "Masukkan teks untuk ditest...",

    // PX → REM
    pxRemReferenceTable: "Tabel Referensi",

    // Color Converter
    colorPickerHint: "Klik untuk pilih warna",

    // JS/TS Formatter
    jsInputPlaceholder: "// Paste kode JavaScript di sini...",
    tsInputPlaceholder: "// Paste kode TypeScript di sini...",

    // CSS Formatter
    cssInputPlaceholder: "/* Paste kode CSS di sini... */",
    scssInputPlaceholder: "// Paste kode SCSS di sini...",
    sassInputPlaceholder: "// Paste kode SASS di sini...",

    // HTML Formatter
    htmlInputPlaceholder: "<!-- Paste kode HTML di sini... -->",

    // SQL Formatter
    sqlInputPlaceholder: "-- Paste query SQL di sini...",

    // Cryptography common
    cryptoKey: "Kunci / Passphrase",
    cryptoKeyPlaceholder: "Masukkan kunci rahasia...",
    cryptoEncrypt: "Enkripsi",
    cryptoDecrypt: "Dekripsi",
    cryptoDecryptError: "Dekripsi gagal. Kunci salah atau ciphertext tidak valid.",

    // AES
    aesInputPlaceholder: "Teks biasa untuk dienkripsi, atau ciphertext Base64 untuk didekripsi...",

    // DES
    desInputPlaceholder: "Teks biasa untuk dienkripsi, atau ciphertext Base64 untuk didekripsi...",

    // RC4
    rc4InputPlaceholder: "Teks biasa untuk dienkripsi, atau ciphertext Base64 untuk didekripsi...",

    // RSA
    rsaKeys: "Kunci",
    rsaKeySize: "Ukuran Kunci",
    rsaGenerate: "Buat Pasangan Kunci",
    rsaGenerating: "Membuat...",
    rsaPublicKey: "Kunci Publik",
    rsaPrivateKey: "Kunci Privat",
    rsaNoKey: "Belum ada kunci — buat di tab Kunci",
    rsaPlaintextPlaceholder: "Masukkan teks untuk dienkripsi (maks ~190 karakter untuk 2048-bit)...",
    rsaCiphertextPlaceholder: "Tempel ciphertext Base64 untuk didekripsi...",

    // ECDSA
    ecdsaCurve: "Kurva",
    ecdsaSign: "Tanda Tangani",
    ecdsaVerify: "Verifikasi",
    ecdsaMessage: "Pesan",
    ecdsaSignature: "Tanda Tangan (Base64)",
    ecdsaValid: "✓ Tanda tangan valid",
    ecdsaInvalid: "✗ Tanda tangan tidak valid",
    ecdsaMessagePlaceholder: "Masukkan pesan untuk ditandatangani atau diverifikasi...",
    ecdsaSignaturePlaceholder: "Tempel tanda tangan Base64...",

    // QR Generator
    qrInputLabel: "Teks / URL",
    qrInputPlaceholder: "https://contoh.com",
    qrErrorLevel: "Koreksi Error",
    qrSize: "Ukuran",
    qrDownload: "Unduh PNG",

    // Barcode Generator
    barcodeFormat: "Format",
    barcodeValue: "Nilai",
    barcodeInputPlaceholder: "Masukkan nilai untuk di-encode...",
    barcodeDownload: "Unduh SVG",

    // Tool Search
    searchPlaceholder: "Cari tool...",
    searchDialogTitle: "Cari Tool",
    searchDialogDesc: "Cari dan navigasi ke tool yang tersedia",
    searchEmpty: "Tool tidak ditemukan.",

    // Not Found
    notFoundTitle: "Halaman Tidak Ditemukan",
    notFoundDesc: "Halaman yang Anda cari tidak ada.",
    notFoundGoHome: "Kembali ke Beranda",
  },
}

export type Translations = {
  readonly [K in keyof typeof translations.en]: string
}

export const navGroupLabels: Record<Language, Record<string, string>> = {
  en: {
    "Format & Validasi": "Format & Validate",
    Encoding: "Encoding",
    Text: "Text",
    Generator: "Generator",
    Cryptography: "Cryptography",
    "Frontend / CSS": "Frontend / CSS",
  },
  id: {
    "Format & Validasi": "Format & Validasi",
    Encoding: "Encoding",
    Text: "Text",
    Generator: "Generator",
    Cryptography: "Kriptografi",
    "Frontend / CSS": "Frontend / CSS",
  },
}

export type Language = "en" | "id";

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
    export: "Export",
    exportJson: "Export JSON",
    exportCsv: "Export CSV",
    exportXlsx: "Export XLSX",

    // Base64
    base64InputPlaceholder: "Enter text or Base64 string...",
    base64EncodeError: "Failed to encode text. Check your input.",
    base64DecodeError: "Input is not valid Base64.",

    // Hex
    hexInputPlaceholder: "Enter text or hex string (e.g. 48656c6c6f)...",
    hexEncodeError: "Failed to encode text.",
    hexDecodeError: "Input is not valid hex.",

    // Base32
    base32InputPlaceholder:
      "Enter text or Base32 string (e.g. JBSWY3DPEB3W64TMMQ======)...",
    base32EncodeError: "Failed to encode text.",
    base32DecodeError: "Input is not valid Base32.",

    // Base58
    base58InputPlaceholder: "Enter text or Base58 string...",
    base58EncodeError: "Failed to encode text.",
    base58DecodeError: "Input is not valid Base58.",

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
    aesInputPlaceholder:
      "Plaintext to encrypt, or Base64 ciphertext to decrypt...",

    // DES
    desInputPlaceholder:
      "Plaintext to encrypt, or Base64 ciphertext to decrypt...",

    // RC4
    rc4InputPlaceholder:
      "Plaintext to encrypt, or Base64 ciphertext to decrypt...",

    // RSA
    rsaKeys: "Keys",
    rsaKeySize: "Key Size",
    rsaGenerate: "Generate Key Pair",
    rsaGenerating: "Generating...",
    rsaPublicKey: "Public Key",
    rsaPrivateKey: "Private Key",
    rsaNoKey: "No key — generate one in Keys tab",
    rsaPlaintextPlaceholder:
      "Enter plaintext to encrypt (max ~190 chars for 2048-bit)...",
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

    // Converter nav group
    converterGroup: "Converter",

    // XML/GraphQL/YAML/TOML Formatter
    xmlParseError: "XML parse error",

    // JSON ↔ CSV
    jsonCsvArrayError: "Input must be a JSON array",
    jsonCsvHeaderError: "CSV must have a header row and at least one data row",

    // JSON Path
    jsonPathExprLabel: "JSONPath Expression",
    jsonPathDocLabel: "JSON Document",
    jsonPathResultsLabel: "Results",
    jsonPathMatch: "match",
    jsonPathMatches: "matches",
    jsonPathResultsPlaceholder: "Results will appear here...",
    jsonPathExampleAllBooks: "All books",
    jsonPathExampleFirstBook: "First book",
    jsonPathExampleAllTitles: "All titles",
    jsonPathExampleStoreName: "Store name",
    jsonPathExampleAllPrices: "All prices",

    // Word Counter
    wordCounterWords: "Words",
    wordCounterCharacters: "Characters",
    wordCounterNoSpaces: "No Spaces",
    wordCounterSentences: "Sentences",
    wordCounterParagraphs: "Paragraphs",
    wordCounterLines: "Lines",
    wordCounterReadingTime: "Reading Time",
    wordCounterMinUnit: "min",
    wordCounterPlaceholder: "Start typing or paste your text here...",

    // Number Base Converter
    numberBaseIntro:
      "Enter a number in any base — the rest update automatically.",
    numberBaseBinary: "Binary",
    numberBaseOctal: "Octal",
    numberBaseDecimal: "Decimal",
    numberBaseHexadecimal: "Hexadecimal",
    numberBaseLabel: "base",
    numberBaseDecimalValue: "Decimal value:",
    numberBaseInvalid: "Invalid value for base",

    // Unix Timestamp Converter
    unixCurrentLabel: "Current Unix timestamp:",
    unixToDateLabel: "Unix Timestamp → Date",
    unixTsPlaceholder: "e.g. 1704067200",
    unixInvalidTimestamp: "Invalid timestamp",
    unixUtcLabel: "UTC",
    unixLocalLabel: "Local",
    unixIso8601Label: "ISO 8601:",
    unixDateToTsLabel: "Date → Unix Timestamp",
    unixInvalidDate: "Invalid date format",
    unixSecondsLabel: "Seconds:",
    unixMillisecondsLabel: "Milliseconds:",

    // Fake Data Generator
    fakeDataTypeLabel: "Type",
    fakeDataCountLabel: "Count",
    fakeDataEmptyState: "Click Generate to create fake data",
    fakeDataPerson: "Person",
    fakeDataAddress: "Address",
    fakeDataInternet: "Internet",
    fakeDataProduct: "Product",
    fakeDataLorem: "Lorem Ipsum",
    fakeDataCustom: "Custom",
    fakeDataShapeLabel: "Shape",
    fakeDataShapeArray: "Array",
    fakeDataShapeObject: "Object",
    fakeDataAddField: "Add Field",
    fakeDataNoFieldsState: "Add at least one field to generate custom data",
    fakeDataFieldNamePlaceholder: "Field name",
    fakeDataArrayLabel: "Array",
    fakeDataFieldFullName: "Full Name",
    fakeDataFieldFirstName: "First Name",
    fakeDataFieldLastName: "Last Name",
    fakeDataFieldEmail: "Email",
    fakeDataFieldPhone: "Phone",
    fakeDataFieldStreet: "Street Address",
    fakeDataFieldCity: "City",
    fakeDataFieldCountry: "Country",
    fakeDataFieldZip: "Zip Code",
    fakeDataFieldCompany: "Company",
    fakeDataFieldJob: "Job Title",
    fakeDataFieldWord: "Word",
    fakeDataFieldSentence: "Sentence",
    fakeDataFieldParagraph: "Paragraph",
    fakeDataFieldNumber: "Number",
    fakeDataFieldBoolean: "Boolean",
    fakeDataFieldUuid: "UUID",
    fakeDataFieldDate: "Date",
    fakeDataDateFormatIso: "YYYY-MM-DD (ISO)",
    fakeDataDateFormatMedium: "12 Jun 2026",
    fakeDataDateFormatLong: "12 June 2026",

    // Cron Generator
    cronExpressionLabel: "Cron Expression",
    cronPresetsLabel: "Presets",
    cronEveryMinute: "Every minute",
    cronRunsAt: "Runs at",
    cronInvalidExpr: "Invalid cron expression",
    cronUnitMinute: "minute",
    cronUnitHour: "hour",
    cronUnitDay: "day",
    cronUnitMonth: "month",
    cronUnitWeekday: "weekday",
    cronEveryUnit: "every",
    cronFieldMinute: "Minute",
    cronFieldHour: "Hour",
    cronFieldDayOfMonth: "Day of Month",
    cronFieldMonth: "Month",
    cronFieldDayOfWeek: "Day of Week",
    cronPresetEveryMinute: "Every minute",
    cronPresetEveryHour: "Every hour",
    cronPresetDailyMidnight: "Every day at midnight",
    cronPresetDailyNoon: "Every day at noon",
    cronPresetWeeklySunday: "Every Sunday at midnight",
    cronPresetMondayNine: "Every Monday at 9am",
    cronPresetFirstOfMonth: "First day of month",
    cronPreset15Min: "Every 15 minutes",
    cronPreset6Hours: "Every 6 hours",
    cronPresetWeekdaysNine: "Weekdays at 9am",

    // Box Shadow Generator
    boxShadowLabel: "Shadows",
    boxShadowAdd: "Add",
    boxShadowItem: "Shadow",
    boxShadowXOffset: "X Offset",
    boxShadowYOffset: "Y Offset",
    boxShadowBlur: "Blur",
    boxShadowSpread: "Spread",
    boxShadowColorLabel: "Color",
    boxShadowInsetLabel: "Inset",
    boxShadowOn: "On",
    boxShadowOff: "Off",

    // Gradient Generator
    gradientTypeLabel: "Type",
    gradientAngleLabel: "Angle",
    gradientLinear: "Linear",
    gradientRadial: "Radial",
    gradientConic: "Conic",
    gradientColorStops: "Color Stops",
    gradientAddStop: "Add Stop"
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
    export: "Ekspor",
    exportJson: "Ekspor JSON",
    exportCsv: "Ekspor CSV",
    exportXlsx: "Ekspor XLSX",

    // Base64
    base64InputPlaceholder: "Masukkan teks atau string Base64...",
    base64EncodeError: "Gagal mengencoding teks. Periksa input Anda.",
    base64DecodeError: "Input bukan Base64 yang valid.",

    // Hex
    hexInputPlaceholder: "Masukkan teks atau string hex (mis. 48656c6c6f)...",
    hexEncodeError: "Gagal mengencoding teks.",
    hexDecodeError: "Input bukan hex yang valid.",

    // Base32
    base32InputPlaceholder:
      "Masukkan teks atau string Base32 (mis. JBSWY3DPEB3W64TMMQ======)...",
    base32EncodeError: "Gagal mengencoding teks.",
    base32DecodeError: "Input bukan Base32 yang valid.",

    // Base58
    base58InputPlaceholder: "Masukkan teks atau string Base58...",
    base58EncodeError: "Gagal mengencoding teks.",
    base58DecodeError: "Input bukan Base58 yang valid.",

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
    cryptoDecryptError:
      "Dekripsi gagal. Kunci salah atau ciphertext tidak valid.",

    // AES
    aesInputPlaceholder:
      "Teks biasa untuk dienkripsi, atau ciphertext Base64 untuk didekripsi...",

    // DES
    desInputPlaceholder:
      "Teks biasa untuk dienkripsi, atau ciphertext Base64 untuk didekripsi...",

    // RC4
    rc4InputPlaceholder:
      "Teks biasa untuk dienkripsi, atau ciphertext Base64 untuk didekripsi...",

    // RSA
    rsaKeys: "Kunci",
    rsaKeySize: "Ukuran Kunci",
    rsaGenerate: "Buat Pasangan Kunci",
    rsaGenerating: "Membuat...",
    rsaPublicKey: "Kunci Publik",
    rsaPrivateKey: "Kunci Privat",
    rsaNoKey: "Belum ada kunci — buat di tab Kunci",
    rsaPlaintextPlaceholder:
      "Masukkan teks untuk dienkripsi (maks ~190 karakter untuk 2048-bit)...",
    rsaCiphertextPlaceholder: "Tempel ciphertext Base64 untuk didekripsi...",

    // ECDSA
    ecdsaCurve: "Kurva",
    ecdsaSign: "Tanda Tangani",
    ecdsaVerify: "Verifikasi",
    ecdsaMessage: "Pesan",
    ecdsaSignature: "Tanda Tangan (Base64)",
    ecdsaValid: "✓ Tanda tangan valid",
    ecdsaInvalid: "✗ Tanda tangan tidak valid",
    ecdsaMessagePlaceholder:
      "Masukkan pesan untuk ditandatangani atau diverifikasi...",
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

    // Converter nav group
    converterGroup: "Converter",

    // XML/GraphQL/YAML/TOML Formatter
    xmlParseError: "Kesalahan parsing XML",

    // JSON ↔ CSV
    jsonCsvArrayError: "Input harus berupa array JSON",
    jsonCsvHeaderError:
      "CSV harus memiliki baris header dan minimal satu baris data",

    // JSON Path
    jsonPathExprLabel: "Ekspresi JSONPath",
    jsonPathDocLabel: "Dokumen JSON",
    jsonPathResultsLabel: "Hasil",
    jsonPathMatch: "hasil",
    jsonPathMatches: "hasil",
    jsonPathResultsPlaceholder: "Hasil akan muncul di sini...",
    jsonPathExampleAllBooks: "Semua buku",
    jsonPathExampleFirstBook: "Buku pertama",
    jsonPathExampleAllTitles: "Semua judul",
    jsonPathExampleStoreName: "Nama toko",
    jsonPathExampleAllPrices: "Semua harga",

    // Word Counter
    wordCounterWords: "Kata",
    wordCounterCharacters: "Karakter",
    wordCounterNoSpaces: "Tanpa Spasi",
    wordCounterSentences: "Kalimat",
    wordCounterParagraphs: "Paragraf",
    wordCounterLines: "Baris",
    wordCounterReadingTime: "Waktu Baca",
    wordCounterMinUnit: "menit",
    wordCounterPlaceholder: "Mulai mengetik atau tempel teks Anda di sini...",

    // Number Base Converter
    numberBaseIntro:
      "Masukkan angka dalam basis apa pun — sisanya akan otomatis diperbarui.",
    numberBaseBinary: "Biner",
    numberBaseOctal: "Oktal",
    numberBaseDecimal: "Desimal",
    numberBaseHexadecimal: "Heksadesimal",
    numberBaseLabel: "basis",
    numberBaseDecimalValue: "Nilai desimal:",
    numberBaseInvalid: "Nilai tidak valid untuk basis",

    // Unix Timestamp Converter
    unixCurrentLabel: "Timestamp Unix saat ini:",
    unixToDateLabel: "Unix Timestamp → Tanggal",
    unixTsPlaceholder: "mis. 1704067200",
    unixInvalidTimestamp: "Timestamp tidak valid",
    unixUtcLabel: "UTC",
    unixLocalLabel: "Lokal",
    unixIso8601Label: "ISO 8601:",
    unixDateToTsLabel: "Tanggal → Unix Timestamp",
    unixInvalidDate: "Format tanggal tidak valid",
    unixSecondsLabel: "Detik:",
    unixMillisecondsLabel: "Milidetik:",

    // Fake Data Generator
    fakeDataTypeLabel: "Tipe",
    fakeDataCountLabel: "Jumlah",
    fakeDataEmptyState: "Klik Generate untuk membuat data palsu",
    fakeDataPerson: "Orang",
    fakeDataAddress: "Alamat",
    fakeDataInternet: "Internet",
    fakeDataProduct: "Produk",
    fakeDataLorem: "Lorem Ipsum",
    fakeDataCustom: "Kustom",
    fakeDataShapeLabel: "Bentuk",
    fakeDataShapeArray: "Array",
    fakeDataShapeObject: "Object",
    fakeDataAddField: "Tambah Field",
    fakeDataNoFieldsState:
      "Tambahkan minimal satu field untuk membuat data kustom",
    fakeDataFieldNamePlaceholder: "Nama field",
    fakeDataArrayLabel: "Array",
    fakeDataFieldFullName: "Nama Lengkap",
    fakeDataFieldFirstName: "Nama Depan",
    fakeDataFieldLastName: "Nama Belakang",
    fakeDataFieldEmail: "Email",
    fakeDataFieldPhone: "Telepon",
    fakeDataFieldStreet: "Alamat Jalan",
    fakeDataFieldCity: "Kota",
    fakeDataFieldCountry: "Negara",
    fakeDataFieldZip: "Kode Pos",
    fakeDataFieldCompany: "Perusahaan",
    fakeDataFieldJob: "Jabatan",
    fakeDataFieldWord: "Kata",
    fakeDataFieldSentence: "Kalimat",
    fakeDataFieldParagraph: "Paragraf",
    fakeDataFieldNumber: "Angka",
    fakeDataFieldBoolean: "Boolean",
    fakeDataFieldUuid: "UUID",
    fakeDataFieldDate: "Tanggal",
    fakeDataDateFormatIso: "YYYY-MM-DD (ISO)",
    fakeDataDateFormatMedium: "12 Jun 2026",
    fakeDataDateFormatLong: "12 June 2026",

    // Cron Generator
    cronExpressionLabel: "Ekspresi Cron",
    cronPresetsLabel: "Preset",
    cronEveryMinute: "Setiap menit",
    cronRunsAt: "Berjalan pada",
    cronInvalidExpr: "Ekspresi cron tidak valid",
    cronUnitMinute: "menit",
    cronUnitHour: "jam",
    cronUnitDay: "hari",
    cronUnitMonth: "bulan",
    cronUnitWeekday: "hari dalam minggu",
    cronEveryUnit: "setiap",
    cronFieldMinute: "Menit",
    cronFieldHour: "Jam",
    cronFieldDayOfMonth: "Hari dalam Bulan",
    cronFieldMonth: "Bulan",
    cronFieldDayOfWeek: "Hari dalam Minggu",
    cronPresetEveryMinute: "Setiap menit",
    cronPresetEveryHour: "Setiap jam",
    cronPresetDailyMidnight: "Setiap hari pukul 00:00",
    cronPresetDailyNoon: "Setiap hari pukul 12:00",
    cronPresetWeeklySunday: "Setiap Minggu pukul 00:00",
    cronPresetMondayNine: "Setiap Senin pukul 9 pagi",
    cronPresetFirstOfMonth: "Hari pertama tiap bulan",
    cronPreset15Min: "Setiap 15 menit",
    cronPreset6Hours: "Setiap 6 jam",
    cronPresetWeekdaysNine: "Hari kerja pukul 9 pagi",

    // Box Shadow Generator
    boxShadowLabel: "Shadow",
    boxShadowAdd: "Tambah",
    boxShadowItem: "Shadow",
    boxShadowXOffset: "Offset X",
    boxShadowYOffset: "Offset Y",
    boxShadowBlur: "Blur",
    boxShadowSpread: "Spread",
    boxShadowColorLabel: "Warna",
    boxShadowInsetLabel: "Inset",
    boxShadowOn: "Aktif",
    boxShadowOff: "Nonaktif",

    // Gradient Generator
    gradientTypeLabel: "Tipe",
    gradientAngleLabel: "Sudut",
    gradientLinear: "Linear",
    gradientRadial: "Radial",
    gradientConic: "Conic",
    gradientColorStops: "Color Stops",
    gradientAddStop: "Tambah Stop"
  }
};

export type Translations = {
  readonly [K in keyof typeof translations.en]: string;
};

export const navGroupLabels: Record<Language, Record<string, string>> = {
  en: {
    "Format & Validasi": "Format & Validate",
    Converter: "Converter",
    Encoding: "Encoding",
    Text: "Text",
    Generator: "Generator",
    Cryptography: "Cryptography",
    "Frontend / CSS": "Frontend / CSS"
  },
  id: {
    "Format & Validasi": "Format & Validasi",
    Converter: "Converter",
    Encoding: "Encoding",
    Text: "Text",
    Generator: "Generator",
    Cryptography: "Kriptografi",
    "Frontend / CSS": "Frontend / CSS"
  }
};

export const navGroupDescriptions: Record<Language, Record<string, string>> = {
  en: {
    "Format & Validasi":
      "Format, pretty-print, minify, and validate structured data formats — JSON, SQL, HTML, CSS, XML, YAML, TOML, GraphQL.",
    Converter:
      "Bidirectional converters between formats and units — JSON↔YAML, JSON↔CSV, timestamps, number bases, and more.",
    Encoding:
      "Encode and decode data across common formats — Base64, URL encoding, HTML entities, JWT tokens, and cryptographic hashes.",
    Text: "Text analysis and manipulation — diff checker, case converter, regex tester, word counter, Markdown preview, and JSON path query.",
    Generator:
      "Generate content and unique values — UUIDs, passwords, QR codes, barcodes, fake data, lorem ipsum, and cron expressions.",
    Cryptography:
      "Encryption, decryption, and digital signatures — AES, DES/3DES, RSA, RC4, ECDSA, and HMAC-based API signing.",
    "Frontend / CSS":
      "CSS generators and frontend utilities — gradients, box shadows, Tailwind cheatsheet, px↔rem conversion, and color converter."
  },
  id: {
    "Format & Validasi":
      "Format, pretty-print, minify, dan validasi format data terstruktur — JSON, SQL, HTML, CSS, XML, YAML, TOML, GraphQL.",
    Converter:
      "Konverter dua arah antar format dan satuan — JSON↔YAML, JSON↔CSV, timestamp, basis angka, dan lainnya.",
    Encoding:
      "Encode dan decode data ke berbagai format — Base64, URL encoding, HTML entities, JWT token, dan hash kriptografi.",
    Text: "Analisis dan manipulasi teks — diff checker, case converter, regex tester, word counter, Markdown preview, dan JSON path query.",
    Generator:
      "Generate konten dan nilai unik — UUID, password, QR code, barcode, data palsu, lorem ipsum, dan ekspresi cron.",
    Cryptography:
      "Enkripsi, dekripsi, dan tanda tangan digital — AES, DES/3DES, RSA, RC4, ECDSA, dan API signing berbasis HMAC.",
    "Frontend / CSS":
      "Generator CSS dan utilitas frontend — gradient, box shadow, Tailwind cheatsheet, konversi px↔rem, dan color converter."
  }
};

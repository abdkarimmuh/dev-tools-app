import {
  AlignLeft,
  ArrowLeftRight,
  Asterisk,
  Barcode,
  Braces,
  CaseSensitive,
  Code,
  Database,
  FileCode,
  FileCode2,
  FileText,
  Fingerprint,
  Hash,
  Key,
  KeyRound,
  Link,
  Lock,
  type LucideIcon,
  Paintbrush,
  Palette,
  QrCode,
  Ruler,
  Shield,
  ShieldCheck,
  Webhook,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navMenus: NavGroup[] = [
  {
    label: "Format & Validasi",
    items: [
      { title: "JSON Formatter", url: "/tools/json-formatter", icon: Braces },
      { title: "JavaScript Formatter", url: "/tools/js-formatter", icon: FileCode2 },
      { title: "TypeScript Formatter", url: "/tools/ts-formatter", icon: FileCode },
      { title: "HTML Formatter", url: "/tools/html-formatter", icon: Code },
      { title: "CSS / SCSS / SASS Formatter", url: "/tools/css-formatter", icon: Paintbrush },
      { title: "SQL Formatter", url: "/tools/sql-formatter", icon: Database },
    ],
  },
  {
    label: "Encoding",
    items: [
      { title: "Base64", url: "/tools/base64", icon: KeyRound },
      { title: "URL Encode/Decode", url: "/tools/url-encode", icon: Link },
      { title: "HTML Entities", url: "/tools/html-entities", icon: Code },
      { title: "JWT Decoder", url: "/tools/jwt-decoder", icon: Lock },
      { title: "Hash Generator", url: "/tools/hash-generator", icon: Shield },
    ],
  },
  {
    label: "Text",
    items: [
      {
        title: "Diff Checker",
        url: "/tools/diff-checker",
        icon: ArrowLeftRight,
      },
      {
        title: "Case Converter",
        url: "/tools/case-converter",
        icon: CaseSensitive,
      },
      { title: "Regex Tester", url: "/tools/regex-tester", icon: Asterisk },
      { title: "Markdown Preview", url: "/tools/markdown-preview", icon: FileText },
    ],
  },
  {
    label: "Generator",
    items: [
      { title: "UUID Generator", url: "/tools/uuid-generator", icon: Hash },
      { title: "Lorem Ipsum", url: "/tools/lorem-ipsum", icon: AlignLeft },
      {
        title: "Password Generator",
        url: "/tools/password-generator",
        icon: Shield,
      },
      { title: "QR Generator", url: "/tools/qr-generator", icon: QrCode },
      {
        title: "Barcode Generator",
        url: "/tools/barcode-generator",
        icon: Barcode,
      },
    ],
  },
  {
    label: "Cryptography",
    items: [
      { title: "AES Cipher", url: "/tools/aes-cipher", icon: Lock },
      { title: "DES / 3DES Cipher", url: "/tools/des-cipher", icon: ShieldCheck },
      { title: "RC4 Cipher", url: "/tools/rc4-cipher", icon: Shield },
      { title: "RSA", url: "/tools/rsa", icon: Key },
      { title: "ECDSA", url: "/tools/ecdsa", icon: Fingerprint },
      { title: "API Signature (HMAC)", url: "/tools/api-signature", icon: Webhook },
    ],
  },
  {
    label: "Frontend / CSS",
    items: [
      {
        title: "Color Converter",
        url: "/tools/color-converter",
        icon: Palette,
      },
      { title: "PX → REM", url: "/tools/px-rem", icon: Ruler },
    ],
  },
]

export const navTitleMap: Record<string, string> = Object.fromEntries(
  navMenus.flatMap((group) => group.items.map((item) => [item.url, item.title]))
)

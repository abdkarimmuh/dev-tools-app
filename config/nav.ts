import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  ArrowLeftRight,
  Asterisk,
  Barcode,
  Binary,
  Braces,
  CaseSensitive,
  Clock,
  Code,
  Database,
  FileCode,
  FileCode2,
  FileText,
  Fingerprint,
  Hash,
  Key,
  KeyRound,
  Layers,
  Link,
  Lock,
  Paintbrush,
  Palette,
  QrCode,
  RefreshCw,
  Ruler,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  SunMedium,
  Table,
  TableProperties,
  Type,
  Webhook
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navMenus: NavGroup[] = [
  {
    label: "Format & Validasi",
    items: [
      { title: "JSON Formatter", url: "/tools/json-formatter", icon: Braces },
      {
        title: "JavaScript / TypeScript Formatter",
        url: "/tools/js-formatter",
        icon: FileCode2
      },
      { title: "HTML Formatter", url: "/tools/html-formatter", icon: Code },
      {
        title: "CSS / SCSS / SASS Formatter",
        url: "/tools/css-formatter",
        icon: Paintbrush
      },
      { title: "SQL Formatter", url: "/tools/sql-formatter", icon: Database },
      { title: "XML Formatter", url: "/tools/xml-formatter", icon: Code },
      { title: "YAML Formatter", url: "/tools/yaml-formatter", icon: FileText },
      { title: "TOML Formatter", url: "/tools/toml-formatter", icon: FileCode },
      {
        title: "GraphQL Formatter",
        url: "/tools/graphql-formatter",
        icon: Layers
      }
    ]
  },
  {
    label: "Converter",
    items: [
      { title: "JSON ↔ YAML", url: "/tools/json-yaml", icon: RefreshCw },
      { title: "JSON ↔ CSV", url: "/tools/json-csv", icon: Table },
      { title: "JSON ↔ XML", url: "/tools/json-xml", icon: TableProperties },
      {
        title: "Number Base Converter",
        url: "/tools/number-base",
        icon: Binary
      },
      { title: "Unix Timestamp", url: "/tools/unix-timestamp", icon: Clock }
    ]
  },
  {
    label: "Encoding",
    items: [
      { title: "Base Encoder", url: "/tools/base-encoder", icon: KeyRound },
      { title: "URL Encode/Decode", url: "/tools/url-encode", icon: Link },
      { title: "HTML Entities", url: "/tools/html-entities", icon: Code },
      { title: "JWT Decoder", url: "/tools/jwt-decoder", icon: Lock },
      { title: "Hash Generator", url: "/tools/hash-generator", icon: Shield }
    ]
  },
  {
    label: "Text",
    items: [
      {
        title: "Diff Checker",
        url: "/tools/diff-checker",
        icon: ArrowLeftRight
      },
      {
        title: "Case Converter",
        url: "/tools/case-converter",
        icon: CaseSensitive
      },
      { title: "Regex Tester", url: "/tools/regex-tester", icon: Asterisk },
      {
        title: "Markdown Preview",
        url: "/tools/markdown-preview",
        icon: FileText
      },
      { title: "Word Counter", url: "/tools/word-counter", icon: Type },
      { title: "JSON Path Tester", url: "/tools/json-path", icon: Braces }
    ]
  },
  {
    label: "Generator",
    items: [
      { title: "UUID Generator", url: "/tools/uuid-generator", icon: Hash },
      { title: "Lorem Ipsum", url: "/tools/lorem-ipsum", icon: AlignLeft },
      {
        title: "Password Generator",
        url: "/tools/password-generator",
        icon: Shield
      },
      { title: "QR Generator", url: "/tools/qr-generator", icon: QrCode },
      {
        title: "Barcode Generator",
        url: "/tools/barcode-generator",
        icon: Barcode
      },
      { title: "CRON Generator", url: "/tools/cron-generator", icon: Clock },
      { title: "Fake Data Generator", url: "/tools/fake-data", icon: Sparkles }
    ]
  },
  {
    label: "Cryptography",
    items: [
      { title: "AES Cipher", url: "/tools/aes-cipher", icon: Lock },
      {
        title: "DES / 3DES Cipher",
        url: "/tools/des-cipher",
        icon: ShieldCheck
      },
      { title: "RC4 Cipher", url: "/tools/rc4-cipher", icon: Shield },
      { title: "RSA", url: "/tools/rsa", icon: Key },
      { title: "ECDSA", url: "/tools/ecdsa", icon: Fingerprint },
      {
        title: "API Signature (HMAC)",
        url: "/tools/api-signature",
        icon: Webhook
      }
    ]
  },
  {
    label: "Frontend / CSS",
    items: [
      {
        title: "Color Converter",
        url: "/tools/color-converter",
        icon: Palette
      },
      { title: "PX → REM", url: "/tools/px-rem", icon: Ruler },
      {
        title: "CSS Gradient Generator",
        url: "/tools/gradient-generator",
        icon: SunMedium
      },
      {
        title: "Box Shadow Generator",
        url: "/tools/box-shadow-generator",
        icon: Sliders
      }
    ]
  }
];

export const navTitleMap: Record<string, string> = Object.fromEntries(
  navMenus.flatMap((group) => group.items.map((item) => [item.url, item.title]))
);

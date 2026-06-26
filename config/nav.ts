import {
  AlignLeft,
  ArrowLeftRight,
  Minimize2,
  Asterisk,
  Braces,
  Paintbrush,
  Code,
  Hash,
  KeyRound,
  CaseSensitive,
  Link,
  Lock,
  Palette,
  Ruler,
  Shield,
  type LucideIcon,
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
      { title: "Beautify", url: "/tools/beautify", icon: Paintbrush },
      { title: "Minify", url: "/tools/minify", icon: Minimize2 },
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
      { title: "Diff Checker", url: "/tools/diff-checker", icon: ArrowLeftRight },
      { title: "Case Converter", url: "/tools/case-converter", icon: CaseSensitive },
      { title: "Regex Tester", url: "/tools/regex-tester", icon: Asterisk },
    ],
  },
  {
    label: "Generator",
    items: [
      { title: "UUID Generator", url: "/tools/uuid-generator", icon: Hash },
      { title: "Lorem Ipsum", url: "/tools/lorem-ipsum", icon: AlignLeft },
      { title: "Password Generator", url: "/tools/password-generator", icon: Shield },
    ],
  },
  {
    label: "Frontend / CSS",
    items: [
      { title: "Color Converter", url: "/tools/color-converter", icon: Palette },
      { title: "PX → REM", url: "/tools/px-rem", icon: Ruler },
    ],
  },
]

export const navTitleMap: Record<string, string> = Object.fromEntries(
  navMenus.flatMap((group) => group.items.map((item) => [item.url, item.title]))
)

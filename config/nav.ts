import {
  IconAlignLeft,
  IconArrowsLeftRight,
  IconArrowsMinimize,
  IconAsterisk,
  IconBraces,
  IconBrush,
  IconCode,
  IconHash,
  IconKey,
  IconLetterCase,
  IconLink,
  IconLock,
  IconPalette,
  IconRuler,
  IconShield,
  type Icon,
} from "@tabler/icons-react"

export interface NavItem {
  title: string
  url: string
  icon: Icon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navMenus: NavGroup[] = [
  {
    label: "Format & Validasi",
    items: [
      { title: "JSON Formatter", url: "/tools/json-formatter", icon: IconBraces },
      { title: "Beautify", url: "/tools/beautify", icon: IconBrush },
      { title: "Minify", url: "/tools/minify", icon: IconArrowsMinimize },
    ],
  },
  {
    label: "Encoding",
    items: [
      { title: "Base64", url: "/tools/base64", icon: IconKey },
      { title: "URL Encode/Decode", url: "/tools/url-encode", icon: IconLink },
      { title: "HTML Entities", url: "/tools/html-entities", icon: IconCode },
      { title: "JWT Decoder", url: "/tools/jwt-decoder", icon: IconLock },
      { title: "Hash Generator", url: "/tools/hash-generator", icon: IconShield },
    ],
  },
  {
    label: "Text",
    items: [
      { title: "Diff Checker", url: "/tools/diff-checker", icon: IconArrowsLeftRight },
      { title: "Case Converter", url: "/tools/case-converter", icon: IconLetterCase },
      { title: "Regex Tester", url: "/tools/regex-tester", icon: IconAsterisk },
    ],
  },
  {
    label: "Generator",
    items: [
      { title: "UUID Generator", url: "/tools/uuid-generator", icon: IconHash },
      { title: "Lorem Ipsum", url: "/tools/lorem-ipsum", icon: IconAlignLeft },
      { title: "Password Generator", url: "/tools/password-generator", icon: IconShield },
    ],
  },
  {
    label: "Frontend / CSS",
    items: [
      { title: "Color Converter", url: "/tools/color-converter", icon: IconPalette },
      { title: "PX → REM", url: "/tools/px-rem", icon: IconRuler },
    ],
  },
]

export const navTitleMap: Record<string, string> = Object.fromEntries(
  navMenus.flatMap((group) => group.items.map((item) => [item.url, item.title]))
)

export interface HtmlEntity {
  entity: string;
  numeric: string;
  char: string;
  description: string;
}

export interface HtmlEntitySection {
  title: string;
  entries: HtmlEntity[];
}

function entry(
  name: string,
  code: number,
  char: string,
  description: string
): HtmlEntity {
  return { entity: `&${name};`, numeric: `&#${code};`, char, description };
}

export const SECTIONS: HtmlEntitySection[] = [
  {
    title: "Reserved Characters",
    entries: [
      entry("amp", 38, "&", "Ampersand"),
      entry("lt", 60, "<", "Less-than sign"),
      entry("gt", 62, ">", "Greater-than sign"),
      entry("quot", 34, '"', "Double quotation mark"),
      entry("apos", 39, "'", "Apostrophe")
    ]
  },
  {
    title: "Whitespace",
    entries: [entry("nbsp", 160, " ", "Non-breaking space")]
  },
  {
    title: "Currency",
    entries: [
      entry("cent", 162, "¢", "Cent sign"),
      entry("pound", 163, "£", "Pound sign"),
      entry("yen", 165, "¥", "Yen sign"),
      entry("euro", 8364, "€", "Euro sign"),
      entry("curren", 164, "¤", "Currency sign")
    ]
  },
  {
    title: "Punctuation & Typography",
    entries: [
      entry("hellip", 8230, "…", "Horizontal ellipsis"),
      entry("mdash", 8212, "—", "Em dash"),
      entry("ndash", 8211, "–", "En dash"),
      entry("lsquo", 8216, "‘", "Left single quotation mark"),
      entry("rsquo", 8217, "’", "Right single quotation mark"),
      entry("ldquo", 8220, "“", "Left double quotation mark"),
      entry("rdquo", 8221, "”", "Right double quotation mark"),
      entry("bull", 8226, "•", "Bullet"),
      entry("dagger", 8224, "†", "Dagger"),
      entry("Dagger", 8225, "‡", "Double dagger"),
      entry("permil", 8240, "‰", "Per mille sign")
    ]
  },
  {
    title: "Symbols",
    entries: [
      entry("copy", 169, "©", "Copyright sign"),
      entry("reg", 174, "®", "Registered trademark sign"),
      entry("trade", 8482, "™", "Trademark sign"),
      entry("sect", 167, "§", "Section sign"),
      entry("para", 182, "¶", "Pilcrow (paragraph sign)"),
      entry("deg", 176, "°", "Degree sign"),
      entry("plusmn", 177, "±", "Plus-minus sign"),
      entry("times", 215, "×", "Multiplication sign"),
      entry("divide", 247, "÷", "Division sign"),
      entry("micro", 181, "µ", "Micro sign"),
      entry("middot", 183, "·", "Middle dot")
    ]
  },
  {
    title: "Fractions",
    entries: [
      entry("frac12", 189, "½", "One half"),
      entry("frac14", 188, "¼", "One quarter"),
      entry("frac34", 190, "¾", "Three quarters")
    ]
  },
  {
    title: "Arrows",
    entries: [
      entry("larr", 8592, "←", "Left arrow"),
      entry("uarr", 8593, "↑", "Up arrow"),
      entry("rarr", 8594, "→", "Right arrow"),
      entry("darr", 8595, "↓", "Down arrow"),
      entry("harr", 8596, "↔", "Left-right arrow")
    ]
  },
  {
    title: "Card Suits",
    entries: [
      entry("spades", 9824, "♠", "Black spade suit"),
      entry("clubs", 9827, "♣", "Black club suit"),
      entry("hearts", 9829, "♥", "Black heart suit"),
      entry("diams", 9830, "♦", "Black diamond suit")
    ]
  },
  {
    title: "Greek Letters",
    entries: [
      entry("alpha", 945, "α", "Greek small letter alpha"),
      entry("beta", 946, "β", "Greek small letter beta"),
      entry("gamma", 947, "γ", "Greek small letter gamma"),
      entry("delta", 948, "δ", "Greek small letter delta"),
      entry("epsilon", 949, "ε", "Greek small letter epsilon"),
      entry("theta", 952, "θ", "Greek small letter theta"),
      entry("lambda", 955, "λ", "Greek small letter lambda"),
      entry("pi", 960, "π", "Greek small letter pi"),
      entry("sigma", 963, "σ", "Greek small letter sigma"),
      entry("phi", 966, "φ", "Greek small letter phi"),
      entry("omega", 969, "ω", "Greek small letter omega"),
      entry("Delta", 916, "Δ", "Greek capital letter delta"),
      entry("Omega", 937, "Ω", "Greek capital letter omega"),
      entry("Sigma", 931, "Σ", "Greek capital letter sigma")
    ]
  }
];

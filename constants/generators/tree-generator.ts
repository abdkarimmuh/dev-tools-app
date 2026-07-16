export interface TreeCharset {
  branch: string;
  lastBranch: string;
  vertical: string;
  blank: string;
}

export const CHARSETS: Record<"unicode" | "ascii", TreeCharset> = {
  unicode: {
    branch: "├── ",
    lastBranch: "└── ",
    vertical: "│   ",
    blank: "    "
  },
  ascii: {
    branch: "|-- ",
    lastBranch: "`-- ",
    vertical: "|   ",
    blank: "    "
  }
};

export const DEFAULT_TREE_INPUT = `project
  src
    components
      Button.tsx
      Header.tsx
    utils
      helpers.ts
    index.ts
  public
    favicon.ico
  package.json
  README.md`;

interface TreeNode {
  name: string;
  children: TreeNode[];
}

function parseIndentedText(text: string): TreeNode {
  const root: TreeNode = { name: "", children: [] };
  const stack: { node: TreeNode; indent: number }[] = [
    { node: root, indent: -1 }
  ];

  for (const rawLine of text.split("\n")) {
    if (!rawLine.trim()) continue;

    const indentMatch = rawLine.match(/^[ \t]*/);
    const indent = indentMatch ? indentMatch[0].length : 0;
    const name = rawLine
      .trim()
      .replace(/^[-*+]\s+/, "")
      .replace(/\/$/, "");

    const node: TreeNode = { name, children: [] };

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    stack[stack.length - 1].node.children.push(node);
    stack.push({ node, indent });
  }

  return root;
}

function renderNode(
  node: TreeNode,
  prefix: string,
  isLast: boolean,
  isTop: boolean,
  charset: TreeCharset,
  trailingSlash: boolean,
  lines: string[]
): void {
  const suffix = trailingSlash && node.children.length > 0 ? "/" : "";
  if (isTop) {
    lines.push(node.name + suffix);
  } else {
    const connector = isLast ? charset.lastBranch : charset.branch;
    lines.push(prefix + connector + node.name + suffix);
  }

  const childPrefix = isTop
    ? ""
    : prefix + (isLast ? charset.blank : charset.vertical);

  node.children.forEach((child, i) => {
    renderNode(
      child,
      childPrefix,
      i === node.children.length - 1,
      false,
      charset,
      trailingSlash,
      lines
    );
  });
}

export interface GenerateTreeOptions {
  charset: "unicode" | "ascii";
  trailingSlash: boolean;
}

export function generateTree(
  text: string,
  options: GenerateTreeOptions
): string {
  const root = parseIndentedText(text);
  if (root.children.length === 0) return "";

  const charset = CHARSETS[options.charset];
  const lines: string[] = [];

  root.children.forEach((child) => {
    renderNode(child, "", true, true, charset, options.trailingSlash, lines);
  });

  return lines.join("\n");
}

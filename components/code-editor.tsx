"use client";

import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import {
  MSSQL,
  MySQL,
  PLSQL,
  PostgreSQL,
  sql,
  type SQLDialect,
  SQLite,
  StandardSQL
} from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { foldService, StreamLanguage } from "@codemirror/language";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import CodeMirror, {
  type EditorState,
  EditorView,
  type Extension
} from "@uiw/react-codemirror";
import { graphqlLanguageSupport } from "cm6-graphql";
import { useTheme } from "next-themes";
import { useMemo } from "react";

import { type Dialect } from "@/constants/formatters/sql-formatter";
import { cn } from "@/lib/utils";

export type CodeEditorLanguage =
  | "json"
  | "html"
  | "css"
  | "sql"
  | "xml"
  | "yaml"
  | "javascript"
  | "typescript"
  | "toml"
  | "graphql"
  | "text";

const SQL_DIALECTS: Record<Dialect, SQLDialect> = {
  sql: StandardSQL,
  mysql: MySQL,
  postgresql: PostgreSQL,
  transactsql: MSSQL,
  sqlite: SQLite,
  plsql: PLSQL
};

const tomlLanguage = StreamLanguage.define(toml);

// @codemirror/legacy-modes ports StreamLanguage parsers, which don't build a
// syntax tree — so they don't get automatic fold ranges the way lang-json,
// lang-sql, etc. do. This provides the same indentation-based folding a
// plain text editor gives YAML/TOML/Python-style content.
const indentFoldService = foldService.of((state: EditorState, from: number) => {
  const line = state.doc.lineAt(from);
  if (line.text.trim() === "") return null;
  const baseIndent = line.text.match(/^\s*/)?.[0].length ?? 0;

  let endLine = line;
  for (let n = line.number + 1; n <= state.doc.lines; n++) {
    const next = state.doc.line(n);
    if (next.text.trim() === "") continue;
    const indent = next.text.match(/^\s*/)?.[0].length ?? 0;
    if (indent <= baseIndent) break;
    endLine = next;
  }

  if (endLine.number === line.number) return null;
  return { from: line.to, to: endLine.to };
});

const editorTheme = EditorView.theme({
  "&": { fontSize: "0.875rem", height: "100%" },
  ".cm-content, .cm-gutters": { fontFamily: "var(--font-mono)" },
  ".cm-content": { padding: "0.75rem 0" },
  ".cm-gutters": { backgroundColor: "transparent", border: "none" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { overflow: "auto" }
});

function languageExtension(
  language: CodeEditorLanguage,
  sqlDialect?: Dialect
): Extension {
  switch (language) {
    case "json":
      return json();
    case "html":
      return html();
    case "css":
      return css();
    case "sql":
      return sql({ dialect: SQL_DIALECTS[sqlDialect ?? "sql"] });
    case "xml":
      return xml();
    case "yaml":
      return yaml();
    case "javascript":
      return javascript();
    case "typescript":
      return javascript({ typescript: true });
    case "toml":
      return [tomlLanguage, indentFoldService];
    case "graphql":
      return graphqlLanguageSupport();
    case "text":
      return [];
  }
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: CodeEditorLanguage;
  sqlDialect?: Dialect;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language,
  sqlDialect,
  placeholder,
  className,
  readOnly
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const extensions = useMemo(
    () => [languageExtension(language, sqlDialect), editorTheme],
    [language, sqlDialect]
  );

  return (
    <div
      className={cn(
        "bg-background focus-within:ring-ring overflow-hidden rounded-md border focus-within:ring-2",
        className
      )}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        height="100%"
        extensions={extensions}
        placeholder={placeholder}
        basicSetup={{ tabSize: 2 }}
        readOnly={readOnly}
      />
    </div>
  );
}

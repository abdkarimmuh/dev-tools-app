export type Dialect =
  | "sql"
  | "mysql"
  | "postgresql"
  | "transactsql"
  | "sqlite"
  | "plsql"

export const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "sql", label: "SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "transactsql", label: "T-SQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "plsql", label: "PL/SQL" },
]

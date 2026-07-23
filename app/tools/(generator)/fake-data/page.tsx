"use client";

import { Check, Copy, Download, Plus, RefreshCw, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  CITIES,
  COMPANIES,
  DOMAINS,
  FIRST_NAMES,
  JOBS,
  LAST_NAMES,
  LOREM,
  STREETS
} from "@/constants/generators/fake-data";
import { useLanguage } from "@/contexts/language-context";
import { useStorage } from "@/hooks/use-storage";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

const COUNTRIES = ["US", "ID", "UK", "AU", "CA", "DE", "FR"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSentence(): string {
  const wordCount = randInt(8, 20);
  const words = Array.from({ length: wordCount }, () => rand(LOREM));
  return (
    words[0].charAt(0).toUpperCase() +
    words[0].slice(1) +
    " " +
    words.slice(1).join(" ") +
    "."
  );
}

function generateLoremParagraph(): string {
  const sentences = randInt(3, 6);
  return Array.from({ length: sentences }, generateSentence).join(" ");
}

function randomDate(): Date {
  const past = Date.now() - randInt(0, 5 * 365) * 24 * 60 * 60 * 1000;
  return new Date(past);
}

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

type DateFormat =
  | "iso"
  | "ddmmyyyyDash"
  | "ddmmyyyySlash"
  | "mmddyyyySlash"
  | "mediumDate"
  | "longDate";

function formatDate(date: Date, format: DateFormat): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  switch (format) {
    case "ddmmyyyyDash":
      return `${dd}-${mm}-${yyyy}`;
    case "ddmmyyyySlash":
      return `${dd}/${mm}/${yyyy}`;
    case "mmddyyyySlash":
      return `${mm}/${dd}/${yyyy}`;
    case "mediumDate":
      return `${date.getDate()} ${MONTH_ABBR[date.getMonth()]} ${yyyy}`;
    case "longDate":
      return `${date.getDate()} ${MONTH_FULL[date.getMonth()]} ${yyyy}`;
    case "iso":
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

type FieldType =
  | "fullName"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "street"
  | "city"
  | "country"
  | "zip"
  | "company"
  | "job"
  | "word"
  | "sentence"
  | "paragraph"
  | "number"
  | "boolean"
  | "uuid"
  | "date";

interface CustomField {
  id: string;
  key: string;
  type: FieldType;
  isArray: boolean;
  arrayLength: number;
  dateFormat: DateFormat;
}

type OutputShape = "array" | "object";

function generateFieldValue(type: FieldType, dateFormat: DateFormat): unknown {
  switch (type) {
    case "fullName":
      return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
    case "firstName":
      return rand(FIRST_NAMES);
    case "lastName":
      return rand(LAST_NAMES);
    case "email": {
      const first = rand(FIRST_NAMES);
      const last = rand(LAST_NAMES);
      return `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@${rand(DOMAINS)}`;
    }
    case "phone":
      return `+1${randInt(200, 999)}${randInt(100, 999)}${randInt(1000, 9999)}`;
    case "street":
      return `${randInt(1, 999)} ${rand(STREETS)}`;
    case "city":
      return rand(CITIES);
    case "country":
      return rand(COUNTRIES);
    case "zip":
      return String(randInt(10000, 99999));
    case "company":
      return rand(COMPANIES);
    case "job":
      return rand(JOBS);
    case "word":
      return rand(LOREM);
    case "sentence":
      return generateSentence();
    case "paragraph":
      return generateLoremParagraph();
    case "number":
      return randInt(1, 1000);
    case "boolean":
      return Math.random() < 0.5;
    case "uuid":
      return crypto.randomUUID();
    case "date":
      return formatDate(randomDate(), dateFormat);
  }
}

function generateFieldForSchema(field: CustomField): unknown {
  if (field.isArray) {
    const len = Math.min(20, Math.max(1, field.arrayLength || 1));
    return Array.from({ length: len }, () =>
      generateFieldValue(field.type, field.dateFormat)
    );
  }
  return generateFieldValue(field.type, field.dateFormat);
}

function generateCustomItem(fields: CustomField[]): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((f, i) => [
      f.key.trim() || `field${i + 1}`,
      generateFieldForSchema(f)
    ])
  );
}

function downloadBlob(content: BlobPart, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toRows(data: unknown): Record<string, unknown>[] {
  const arr = Array.isArray(data) ? data : [data];
  return arr.map((item) =>
    item !== null && typeof item === "object" && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : { value: item }
  );
}

function toCsv(data: unknown): string {
  const rows = toRows(data);
  if (rows.length === 0) return "";
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: unknown) => {
    const str =
      v === null || v === undefined
        ? ""
        : typeof v === "object"
          ? JSON.stringify(v)
          : String(v);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))
  ];
  return lines.join("\n");
}

export default function FakeDataPage() {
  const { t } = useLanguage();
  const FIELD_TYPES: { value: FieldType; label: string }[] = [
    { value: "fullName", label: t.fakeDataFieldFullName },
    { value: "firstName", label: t.fakeDataFieldFirstName },
    { value: "lastName", label: t.fakeDataFieldLastName },
    { value: "email", label: t.fakeDataFieldEmail },
    { value: "phone", label: t.fakeDataFieldPhone },
    { value: "street", label: t.fakeDataFieldStreet },
    { value: "city", label: t.fakeDataFieldCity },
    { value: "country", label: t.fakeDataFieldCountry },
    { value: "zip", label: t.fakeDataFieldZip },
    { value: "company", label: t.fakeDataFieldCompany },
    { value: "job", label: t.fakeDataFieldJob },
    { value: "word", label: t.fakeDataFieldWord },
    { value: "sentence", label: t.fakeDataFieldSentence },
    { value: "paragraph", label: t.fakeDataFieldParagraph },
    { value: "number", label: t.fakeDataFieldNumber },
    { value: "boolean", label: t.fakeDataFieldBoolean },
    { value: "uuid", label: t.fakeDataFieldUuid },
    { value: "date", label: t.fakeDataFieldDate }
  ];
  const DATE_FORMATS: { value: DateFormat; label: string }[] = [
    { value: "iso", label: t.fakeDataDateFormatIso },
    { value: "ddmmyyyyDash", label: "DD-MM-YYYY" },
    { value: "ddmmyyyySlash", label: "DD/MM/YYYY" },
    { value: "mmddyyyySlash", label: "MM/DD/YYYY" },
    { value: "mediumDate", label: t.fakeDataDateFormatMedium },
    { value: "longDate", label: t.fakeDataDateFormatLong }
  ];

  const [count, setCount] = useToolState("fake-data", "count", 5);
  const [outputShape, setOutputShape] = useToolState<OutputShape>(
    "fake-data",
    "outputShape",
    "array"
  );
  const [customFields, setCustomFields] = useToolState<CustomField[]>(
    "fake-data",
    "customFields",
    [
      {
        id: "1",
        key: "id",
        type: "uuid",
        isArray: false,
        arrayLength: 3,
        dateFormat: "iso"
      }
    ]
  );
  const [output, setOutput] = useState("");
  const [resultData, setResultData] = useState<unknown>(null);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useStorage(
    "code-editor-word-wrap",
    false,
    "local"
  );

  const isCustomObject = outputShape === "object";

  const generate = () => {
    if (customFields.length === 0) return;
    const result = isCustomObject
      ? generateCustomItem(customFields)
      : Array.from({ length: count }, () => generateCustomItem(customFields));
    setResultData(result);
    setOutput(JSON.stringify(result, null, 2));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportJson = () => {
    downloadBlob(
      JSON.stringify(resultData, null, 2),
      "fake-data.json",
      "application/json"
    );
  };

  const exportCsv = () => {
    downloadBlob(toCsv(resultData), "fake-data.csv", "text/csv");
  };

  const exportXlsx = async () => {
    const XLSX = await import("xlsx");
    const rows = toRows(resultData);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "fake-data.xlsx");
  };

  const addField = () => {
    setCustomFields([
      ...customFields,
      {
        id: crypto.randomUUID(),
        key: "",
        type: "word",
        isArray: false,
        arrayLength: 3,
        dateFormat: "iso"
      }
    ]);
  };

  const updateField = (id: string, patch: Partial<CustomField>) => {
    setCustomFields(
      customFields.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const removeField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        {!isCustomObject && (
          <div className="flex flex-col gap-1.5">
            <Label className="mb-1">{t.fakeDataCountLabel}</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) =>
                setCount(
                  Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              className="w-24"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button
            onClick={generate}
            className="gap-2"
            disabled={customFields.length === 0}
          >
            <RefreshCw className="size-4" />
            {t.generate}
          </Button>
          {output && (
            <>
              <Button variant="outline" onClick={copy} className="gap-2">
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? t.copied : t.copy}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" className="gap-2">
                      <Download className="size-4" />
                      {t.export}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportJson}>
                    {t.exportJson}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCsv}>
                    {t.exportCsv}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportXlsx}>
                    {t.exportXlsx}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="fake-data-word-wrap"
              checked={wordWrap}
              onCheckedChange={(c) => setWordWrap(c === true)}
            />
            <Label
              htmlFor="fake-data-word-wrap"
              className="text-sm font-normal"
            >
              {t.wrapLines}
            </Label>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 rounded-md border p-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="mb-1">{t.fakeDataShapeLabel}</Label>
            <Select
              value={outputShape}
              onValueChange={(v) => setOutputShape(v as OutputShape)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="array">{t.fakeDataShapeArray}</SelectItem>
                <SelectItem value="object">{t.fakeDataShapeObject}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={addField}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            {t.fakeDataAddField}
          </Button>
        </div>

        {customFields.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t.fakeDataNoFieldsState}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-md border p-2"
              >
                <Input
                  value={field.key}
                  onChange={(e) =>
                    updateField(field.id, { key: e.target.value })
                  }
                  placeholder={t.fakeDataFieldNamePlaceholder}
                  className="w-36"
                />
                <Select
                  value={field.type}
                  onValueChange={(v) =>
                    updateField(field.id, { type: v as FieldType })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.type === "date" && (
                  <Select
                    value={field.dateFormat}
                    onValueChange={(v) =>
                      updateField(field.id, { dateFormat: v as DateFormat })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMATS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id={`array-${field.id}`}
                    checked={field.isArray}
                    onCheckedChange={(checked) =>
                      updateField(field.id, { isArray: !!checked })
                    }
                  />
                  <Label
                    htmlFor={`array-${field.id}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {t.fakeDataArrayLabel}
                  </Label>
                </div>
                {field.isArray && (
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={field.arrayLength}
                    onChange={(e) =>
                      updateField(field.id, {
                        arrayLength: Math.min(
                          20,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      })
                    }
                    className="w-20"
                  />
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeField(field.id)}
                  className="ml-auto size-8 shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {output ? (
        <CodeEditor
          readOnly
          className="bg-muted min-h-0 flex-1"
          language="json"
          value={output}
          wordWrap={wordWrap}
        />
      ) : (
        <div className="text-muted-foreground flex h-40 items-center justify-center rounded-md border border-dashed text-sm">
          {t.fakeDataEmptyState}
        </div>
      )}
    </div>
  );
}

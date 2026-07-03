export type BarcodeFormat =
  | "CODE128"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "CODE39"
  | "ITF14"
  | "MSI"
  | "pharmacode";

export const FORMATS: { value: BarcodeFormat; label: string; hint: string }[] =
  [
    { value: "CODE128", label: "CODE128", hint: "Any text/numbers" },
    { value: "EAN13", label: "EAN-13", hint: "12 digits" },
    { value: "EAN8", label: "EAN-8", hint: "7 digits" },
    { value: "UPC", label: "UPC-A", hint: "11 digits" },
    { value: "CODE39", label: "CODE39", hint: "0-9 A-Z - . $ / + %" },
    { value: "ITF14", label: "ITF-14", hint: "13 digits" },
    { value: "MSI", label: "MSI", hint: "Numbers only" },
    { value: "pharmacode", label: "Pharmacode", hint: "3–131070" }
  ];

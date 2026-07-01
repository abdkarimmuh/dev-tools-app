"use client"

import { Check, Copy, RefreshCw } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToolState } from "@/hooks/use-tool-state"

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
  "Karen",
  "Leo",
  "Mia",
  "Noah",
  "Olivia",
  "Peter",
  "Quinn",
  "Rachel",
  "Sam",
  "Tina",
  "Uma",
  "Victor",
  "Wendy",
  "Xander",
  "Yara",
  "Zoe",
]
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
]
const DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "protonmail.com",
  "icloud.com",
  "example.com",
  "dev.io",
]
const STREETS = [
  "Main St",
  "Oak Ave",
  "Maple Dr",
  "Cedar Ln",
  "Pine Rd",
  "Elm St",
  "Birch Blvd",
  "Walnut Way",
]
const CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "Austin",
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Medan",
  "Bali",
]
const COMPANIES = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella Corp",
  "Soylent Corp",
  "Hooli",
  "Pied Piper",
  "Dunder Mifflin",
  "Vandelay Industries",
]
const JOBS = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Data Scientist",
  "DevOps Engineer",
  "QA Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "CTO",
  "CEO",
]
const LOREM =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco".split(
    " "
  )

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePerson() {
  const first = rand(FIRST_NAMES)
  const last = rand(LAST_NAMES)
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@${rand(DOMAINS)}`
  const phone = `+1${randInt(200, 999)}${randInt(100, 999)}${randInt(1000, 9999)}`
  return {
    name: `${first} ${last}`,
    email,
    phone,
    age: randInt(18, 65),
    company: rand(COMPANIES),
    job: rand(JOBS),
  }
}

function generateAddress() {
  return {
    street: `${randInt(1, 999)} ${rand(STREETS)}`,
    city: rand(CITIES),
    zip: String(randInt(10000, 99999)),
    country: rand(["US", "ID", "UK", "AU", "CA", "DE", "FR"]),
  }
}

function generateInternet() {
  const first = rand(FIRST_NAMES)
  const last = rand(LAST_NAMES)
  const username = `${first.toLowerCase()}${last.toLowerCase()}${randInt(1, 999)}`
  return {
    username,
    email: `${username}@${rand(DOMAINS)}`,
    url: `https://${username.replace(/\d+/, "")}.${rand(["com", "dev", "io", "net", "org"])}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    ip: `${randInt(1, 254)}.${randInt(0, 254)}.${randInt(0, 254)}.${randInt(1, 254)}`,
  }
}

function generateProduct() {
  const adjectives = [
    "Premium",
    "Classic",
    "Pro",
    "Lite",
    "Ultra",
    "Smart",
    "Eco",
    "Digital",
  ]
  const nouns = [
    "Widget",
    "Gadget",
    "Toolkit",
    "Bundle",
    "Suite",
    "Package",
    "Set",
    "Kit",
  ]
  return {
    name: `${rand(adjectives)} ${rand(nouns)}`,
    price: `$${(randInt(99, 9999) / 100).toFixed(2)}`,
    sku: `SKU-${randInt(100000, 999999)}`,
    category: rand([
      "Electronics",
      "Clothing",
      "Books",
      "Home",
      "Sports",
      "Beauty",
      "Toys",
    ]),
    stock: randInt(0, 500),
  }
}

function generateLoremParagraph(): string {
  const sentences = randInt(3, 6)
  return Array.from({ length: sentences }, () => {
    const wordCount = randInt(8, 20)
    const words = Array.from({ length: wordCount }, () => rand(LOREM))
    return (
      words[0].charAt(0).toUpperCase() +
      words[0].slice(1) +
      " " +
      words.slice(1).join(" ") +
      "."
    )
  }).join(" ")
}

type DataType = "person" | "address" | "internet" | "product" | "lorem"

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: "person", label: "Person" },
  { value: "address", label: "Address" },
  { value: "internet", label: "Internet" },
  { value: "product", label: "Product" },
  { value: "lorem", label: "Lorem Ipsum" },
]

const generators: Record<DataType, () => unknown> = {
  person: generatePerson,
  address: generateAddress,
  internet: generateInternet,
  product: generateProduct,
  lorem: generateLoremParagraph,
}

export default function FakeDataPage() {
  const [dataType, setDataType] = useToolState<DataType>(
    "fake-data",
    "dataType",
    "person"
  )
  const [count, setCount] = useToolState("fake-data", "count", 5)
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    const items = Array.from({ length: count }, generators[dataType])
    setOutput(JSON.stringify(dataType === "lorem" ? items : items, null, 2))
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <Select
            value={dataType}
            onValueChange={(v) => setDataType(v as DataType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATA_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Count</Label>
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
        <Button onClick={generate} className="gap-2">
          <RefreshCw className="size-4" />
          Generate
        </Button>
        {output && (
          <Button variant="outline" onClick={copy} className="gap-2">
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        )}
      </div>

      {output ? (
        <textarea
          readOnly
          className="min-h-0 flex-1 resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
          value={output}
          spellCheck={false}
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Click Generate to create fake data
        </div>
      )}
    </div>
  )
}

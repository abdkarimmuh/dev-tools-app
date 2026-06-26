"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { navMenus } from "@/config/nav"

export function ToolSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Cari tool...</span>
        <kbd className="hidden items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Cari Tool" description="Cari dan navigasi ke tool yang tersedia">
        <Command>
          <CommandInput placeholder="Cari tool..." />
          <CommandList>
            <CommandEmpty>Tool tidak ditemukan.</CommandEmpty>
            {navMenus.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.url}
                    value={item.title}
                    onSelect={() => handleSelect(item.url)}
                  >
                    <item.icon />
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

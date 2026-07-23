"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { useSidebar } from "@/components/ui/sidebar";
import { navMenus } from "@/config/nav";
import { useLanguage } from "@/contexts/language-context";
import { useSearch } from "@/contexts/search-context";
import { navGroupLabels } from "@/lib/i18n";

export function Search() {
  const { t } = useLanguage();
  const { setOpen } = useSearch();
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /mac|darwin/i.test(navigator.userAgent),
    () => false
  );

  return (
    <button
      onClick={() => setOpen(true)}
      className="bg-muted text-muted-foreground hover:bg-muted hover:text-foreground flex w-54 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors"
    >
      <span className="hidden sm:inline">{t.searchPlaceholder}</span>

      {isMac ? (
        <kbd
          suppressHydrationWarning
          className="bg-background hidden items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-xs sm:flex"
        >
          <span className="text-sm">⌘</span> K
        </kbd>
      ) : (
        <kbd
          suppressHydrationWarning
          className="bg-background hidden items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-xs sm:flex"
        >
          Ctrl K
        </kbd>
      )}
    </button>
  );
}

export function ToolSearchDialog() {
  const { language, t } = useLanguage();
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const handleSelect = (url: string) => {
    setOpen(false);
    setOpenMobile(false);
    router.push(url);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t.searchDialogTitle}
      description={t.searchDialogDesc}
    >
      <Command>
        <CommandInput placeholder={t.searchPlaceholder} />
        <CommandList>
          <CommandEmpty>{t.searchEmpty}</CommandEmpty>
          {navMenus.map((group) => (
            <CommandGroup
              key={group.label}
              heading={navGroupLabels[language][group.label] ?? group.label}
            >
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
  );
}

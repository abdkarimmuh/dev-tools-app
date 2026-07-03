"use client";

import Link from "next/link";

import { Card, CardTitle } from "@/components/ui/card";
import { navMenus } from "@/config/nav";
import { useLanguage } from "@/contexts/language-context";
import { navGroupDescriptions, navGroupLabels } from "@/lib/i18n";

export default function HomePage() {
  const { language, t } = useLanguage();

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight">{t.homeTitle}</h2>
        <p className="text-md mt-1">{t.homeSubtitle}</p>
      </div>

      <div className="flex flex-col gap-12">
        {navMenus.map((group) => (
          <section key={group.label}>
            <div className="mb-6">
              <h3 className="font-semibold tracking-widest uppercase">
                {navGroupLabels[language][group.label] ?? group.label}
              </h3>
              {navGroupDescriptions[language][group.label] && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {navGroupDescriptions[language][group.label]}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {group.items.map((item) => (
                <Link key={item.url} href={item.url} className="group">
                  <Card className="h-full transition-colors hover:bg-accent">
                    <div className="flex items-center gap-2 px-5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                        <item.icon className="size-4" />
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {item.title}
                      </CardTitle>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

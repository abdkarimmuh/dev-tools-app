import Link from "next/link"

import { Card, CardTitle } from "@/components/ui/card"
import { navMenus } from "@/config/nav"

export default function HomePage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Semua Tools</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kumpulan tools untuk membantu coding dan debugging sehari-hari.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {navMenus.map((group) => (
          <section key={group.label}>
            <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {group.label}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
  )
}

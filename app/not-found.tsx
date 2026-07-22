"use client";

import { IconFolderCode } from "@tabler/icons-react";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { useLanguage } from "@/contexts/language-context";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>{t.notFoundTitle}</EmptyTitle>
        <EmptyDescription>{t.notFoundDesc}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button
          variant="link"
          className="text-muted-foreground"
          size="sm"
          render={
            <Link href="/">
              {t.notFoundGoHome} <ArrowUpRightIcon />
            </Link>
          }
        />
      </EmptyContent>
    </Empty>
  );
}

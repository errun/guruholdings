'use client';

import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { ExplorerSearch } from '@/components/explorer/ExplorerSearch';
import { Button } from '@/components/ui/button';
import { translate } from '@/lib/i18n/site';

type ExplorerSearchDisclosureProps = ComponentProps<typeof ExplorerSearch>;

export function ExplorerSearchDisclosure(props: ExplorerSearchDisclosureProps) {
  const [open, setOpen] = useState(false);
  const label = translate(props.locale, open ? 'home.search.close' : 'home.search.toggle');

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="home-explorer-search"
        className="gap-2"
      >
        {open ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        {label}
      </Button>
      {open && (
        <div id="home-explorer-search" className="mt-4">
          <ExplorerSearch {...props} compact />
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';
import { FolderOpenDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HistoryTag } from '@/features/cv-checker/types';

interface HistoryListProps {
  tags: HistoryTag[];
  onItemClick: () => void;
}

export function HistoryList({ tags, onItemClick }: HistoryListProps) {
  return (
    <ScrollArea className="h-72 w-full rounded border">
      <div className="p-4">
        {tags.map((tag) => (
          <React.Fragment key={tag.id}>
            <div className={cn('text-sm', tag.status === 'failed' && 'opacity-50')}>
              <Link
                href={tag.link}
                onClick={onItemClick}
                className="flex h-full w-full flex-row items-center gap-2 hover:opacity-70 transition-opacity light:text-white"
              >
                <FolderOpenDot
                  className={cn('w-4 h-4 ', tag.status === 'failed' && 'text-amber-700')}
                />{' '}
                {tag.createdAt}
              </Link>
            </div>
            <Separator className="my-2 last:hidden" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}

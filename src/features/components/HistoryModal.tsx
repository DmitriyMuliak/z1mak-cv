'use client';

import React, { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { BaseInfoResponse, getResentResumeBaseInfo } from '@/actions/sendToAnalyze';
import { Link } from '@/i18n/navigation';
import { paths } from '@/consts/routes';
import { formatToUserDate } from '@/utils/date';
import { FolderOpenDot } from 'lucide-react';

interface HistoryTag extends BaseInfoResponse {
  link: string;
}

export function HistoryModal() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [tags, setTags] = React.useState<HistoryTag[]>([]);
  const locale = useLocale();
  const t = useTranslations('components.historyModal');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const list = await getResentResumeBaseInfo();
        setTags(
          list.map((item) => ({
            ...item,
            createdAt: formatToUserDate(item.createdAt, { locale }),
            link: `${paths.cvReport}?jobId=${item.id}`,
          })),
        );
      } finally {
        setIsLoading(false);
      }
    }
    if (open) fetchData();
  }, [open, locale]);

  const renderContent = () => (
    <>
      {isLoading ? <div className="animate-pulse rounded h-72">{t('loading')}</div> : null}
      {!isLoading && !tags.length ? <div className="p-2 h-72">{t('noHistory')}</div> : null}
      {!isLoading && tags.length ? (
        <HistoryList tags={tags} onItemClick={() => setOpen(false)} />
      ) : null}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-8">{t('trigger')}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] z-50">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="mb-8">{t('trigger')}</Button>
      </DrawerTrigger>
      <DrawerContent className="z-50">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('title')}</DrawerTitle>
          <DrawerDescription>{t('description')}</DrawerDescription>
        </DrawerHeader>
        {renderContent()}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function HistoryList({ tags, onItemClick }: { tags: HistoryTag[]; onItemClick: () => void }) {
  return (
    <ScrollArea className="h-72 w-full rounded-md border">
      <div className="p-4">
        {tags.map((tag) => (
          <React.Fragment key={tag.id}>
            <div className="text-sm">
              <Link
                href={tag.link}
                onClick={onItemClick}
                className="flex h-full w-full flex-row items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <FolderOpenDot className="w-4 h-4" /> {tag.createdAt}
              </Link>
            </div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}

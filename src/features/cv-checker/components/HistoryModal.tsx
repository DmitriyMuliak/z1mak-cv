'use client';

import React from 'react';
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
import { Link } from '@/i18n/navigation';
import { FolderOpenDot, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimationContainer } from '@/components/AnimatedContainer';
import { HistoryTag } from '@/features/cv-checker/types';
import { useQuery } from '@tanstack/react-query';
import { getResentResumeBaseInfo } from '@/actions/resume/resumeActions';
import { formatToUserDate } from '@/utils/date';
import { paths } from '@/consts/routes';

export function HistoryModal() {
  const [open, setOpen] = React.useState(false);
  const locale = useLocale();
  const t = useTranslations('components.historyModal');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const historyQuery = useQuery<HistoryTag[], Error>({
    queryKey: ['resume:history', locale],
    enabled: open,
    queryFn: async () => {
      const list = await getResentResumeBaseInfo();
      return list.map((item) => ({
        ...item,
        createdAt: formatToUserDate(item.createdAt, { locale }),
        link: `${paths.cvReport}?jobId=${item.id}`,
      }));
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const history = historyQuery.data ?? [];
  const isFetching = historyQuery.isFetching;

  const renderContent = () => (
    <>
      {history.length > 0 ? (
        <AnimationContainer id="tag-history-list">
          <HistoryList tags={history} onItemClick={() => setOpen(false)} />
        </AnimationContainer>
      ) : isFetching ? (
        <div className="animate-pulse rounded h-72 flex items-center justify-center">
          {t('loading')}
        </div>
      ) : (
        <div className="p-2 h-72 flex items-center justify-center">{t('noHistory')}</div>
      )}
    </>
  );

  const renderUpdateIcon = () => {
    return (
      isFetching &&
      history.length > 0 && (
        <RefreshCw size={13} className="inline-block animate-spin duration-1500 ml-1 mr-1" />
      )
    );
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-8">{t('trigger')}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] z-50 frosted-card">
          <DialogHeader>
            <DialogTitle className="light:text-white">
              {t('title')}
              {renderUpdateIcon()}
            </DialogTitle>
            <DialogDescription className="light:text-[#c7c7c7]">
              {t('description')}
            </DialogDescription>
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
      <DrawerContent className="z-50 frosted-card [&_[data-slot=drawer-handle]]:bg-primary">
        <DrawerHeader className="text-left">
          <DrawerTitle className="light:text-white">
            <div className="relative w-fit mx-auto">
              {t('title')}
              {/* -right-X або translate-x-full */}
              <span className="absolute top-1/2 -right-6 -translate-y-1/2">
                {renderUpdateIcon()}
              </span>
            </div>
          </DrawerTitle>
          <DrawerDescription className="light:text-white">{t('description')}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">{renderContent()}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t('close')}</Button>
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

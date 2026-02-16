'use client';

import * as React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
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
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function ResponsiveDialog({
  children,
  trigger,
  title,
  description,
  isOpen,
  onOpenChange,
  isLoading,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px] z-50 frosted-card"
          data-testid="responsive-dialog-content"
        >
          <DialogHeader>
            <DialogTitle className="light:text-white">
              <TitleWithLoader title={title} isLoading={isLoading} />
            </DialogTitle>
            {description && (
              <DialogDescription className="light:text-[#c7c7c7]">{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent
        className="z-50 frosted-card [&_[data-slot=drawer-handle]]:bg-primary"
        data-testid="responsive-drawer-content"
      >
        <DrawerHeader className="text-left">
          <DrawerTitle className="light:text-white">
            <TitleWithLoader title={title} isLoading={isLoading} isCenterPosition />
          </DrawerTitle>
          {description && (
            <DrawerDescription className="light:text-white">{description}</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="p-4 pb-0">{children}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" data-testid="drawer-close-button">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const TitleWithLoader = ({
  title,
  isLoading,
  isCenterPosition,
}: {
  title: string;
  isLoading?: boolean;
  isCenterPosition?: boolean;
}) => (
  <div className="relative inline-flex items-center">
    {title}
    {isLoading && (
      <RefreshCw
        size={13}
        className={cn(
          'ml-2 animate-spin text-foreground',
          isCenterPosition && 'absolute -right-2 translate-x-full ',
        )}
      />
    )}
  </div>
);

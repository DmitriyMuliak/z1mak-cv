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

  const TitleWithLoader = () => (
    <div className="flex items-center gap-2">
      {title}
      {isLoading && <RefreshCw size={13} className="animate-spin text-muted-foreground" />}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px] z-50 frosted-card">
          <DialogHeader>
            <DialogTitle className="light:text-white">
              <TitleWithLoader />
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
      <DrawerContent className="z-50 frosted-card [&_[data-slot=drawer-handle]]:bg-primary">
        <DrawerHeader className="text-left">
          <DrawerTitle className="light:text-white">
            <TitleWithLoader />
          </DrawerTitle>
          {description && (
            <DrawerDescription className="light:text-white">{description}</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="p-4 pb-0">{children}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

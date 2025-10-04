'use client';

import { motion } from 'framer-motion';
import { usePathname } from '@/i18n/navigation';

type Props = {
  children: React.ReactNode;
};

export default function TemplateLayout({ children }: Props) {
  const pathName = usePathname();
  return (
    <motion.div
      key={pathName}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';

// Example of usage:
// export default function AboutPage() {
//   return (
//     <PageWrapper>
//       {(onLoaded) => <AboutPageContent onLoaded={onLoaded} />}
//     </PageWrapper>
//   );
// }

type ChildrenPageCallback = (onLoaded: () => void) => ReactNode;

type Props = {
  children: ReactNode | ChildrenPageCallback;
  exitDuration?: number;
};

export const PageWrapper: React.FC<Props> = ({ children, exitDuration = 0.2 }) => {
  const pathName = usePathname();
  const [loaded, setLoaded] = useState(false);
  const handleLoaded = () => setLoaded(true);

  const isChildrenStatic = typeof children !== 'function';

  useEffect(() => {
    isChildrenStatic && setLoaded(true);
  }, [isChildrenStatic]);

  return (
    <motion.div
      key={pathName}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: exitDuration }}
    >
      {typeof children === 'function' ? children(handleLoaded) : children}
    </motion.div>
  );
};

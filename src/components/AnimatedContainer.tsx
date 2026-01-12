import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

export const AnimationContainer = ({ children, id }: PropsWithChildren<{ id: string | null }>) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
};

import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
}

const cardVariants: Variants = {
  hover: {
    y: -2,
    boxShadow: 'none',
    transition: { type: 'spring', stiffness: 300 },
  },
  initial: { y: 0 },
};

export default function PremiumCard({ children, className = '' }: PremiumCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

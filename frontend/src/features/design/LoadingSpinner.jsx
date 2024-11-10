import React from 'react';
import { motion } from 'framer-motion';
import { ProgressSpinner } from 'primereact/progressspinner';
import { classNames } from 'primereact/utils';

const LoadingSpinner = ({ fullScreen = false, className, size = 50 }) => {
  const spinnerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      variants={spinnerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={classNames(
        'flex items-center justify-center',
        {
          'fixed inset-0 bg-black bg-opacity-50 z-50': fullScreen
        },
        className
      )}
    >
      <ProgressSpinner 
        style={{ width: size, height: size }}
        strokeWidth="4"
        fill="var(--surface-ground)"
        animationDuration=".7s"
      />
    </motion.div>
  );
};

export default LoadingSpinner;
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { classNames } from 'primereact/utils';

const AnimatedCard = ({ 
  children, 
  className, 
  hover = true,
  delay = 0,
  ...props 
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut"
      }
    }
  };

  const hoverAnimation = hover ? {
    whileHover: { 
      scale: 1.02,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.98 
    }
  } : {};

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      {...hoverAnimation}
      className={classNames(
        'overflow-hidden',
        className
      )}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
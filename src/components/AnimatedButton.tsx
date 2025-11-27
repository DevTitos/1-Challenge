import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@radix-ui/themes';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function AnimatedButton({ children, onClick, variant = 'primary', disabled = false }: AnimatedButtonProps) {
  const primaryStyle = {
    background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
    border: 'none',
    color: 'black',
    fontWeight: 'bold' as const
  };

  const secondaryStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white'
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        style={variant === 'primary' ? primaryStyle : secondaryStyle}
      >
        {children}
      </Button>
    </motion.div>
  );
}
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../ui/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  asChild = false,
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  
  const baseStyles = 'rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary hover:bg-accent text-primary-foreground shadow-sm hover:shadow-md',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border',
    ghost: 'hover:bg-muted text-foreground',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <Comp 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
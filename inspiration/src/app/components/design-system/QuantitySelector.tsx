import { Minus, Plus } from 'lucide-react';
import { cn } from '../ui/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 99,
  className 
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };
  
  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };
  
  return (
    <div className={cn('inline-flex items-center gap-3 bg-card border border-border rounded-full px-2 py-2', className)}>
      <button
        onClick={handleDecrease}
        disabled={value <= min}
        className="w-8 h-8 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center font-medium">{value}</span>
      <button
        onClick={handleIncrease}
        disabled={value >= max}
        className="w-8 h-8 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

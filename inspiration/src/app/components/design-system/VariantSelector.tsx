import { cn } from '../ui/utils';

interface VariantSelectorProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  label?: string;
}

export function VariantSelector({ options, selected, onChange, label }: VariantSelectorProps) {
  return (
    <div>
      {label && (
        <label className="block mb-3 text-sm">{label}</label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              'px-5 py-2 rounded-full border-2 transition-all duration-200',
              selected === option
                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                : 'bg-card border-border hover:border-accent hover:bg-muted'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

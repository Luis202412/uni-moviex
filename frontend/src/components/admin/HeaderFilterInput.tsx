import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeaderFilterInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function HeaderFilterInput({ value, onChange, placeholder, className }: HeaderFilterInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="pointer-events-none absolute left-0 h-3.5 w-3.5 text-muted-foreground/70" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-6 w-full bg-transparent pl-5 text-sm font-medium text-foreground placeholder:text-foreground/90 focus:outline-none"
      />
    </div>
  );
}


'use client';

import { FormInput } from './FormInput';
import { Button } from './Button';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBox({
  value,
  onChange,
  onSearch,
  placeholder = '검색...',
  className,
}: SearchBoxProps) {
  const handleSearch = () => {
    onSearch?.(value);
  };

  const handleClear = () => {
    onChange('');
    onSearch?.('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="flex-1">
          <FormInput
            label=""
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        </div>
        {value && (
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          검색
        </Button>
      </div>
    </div>
  );
}

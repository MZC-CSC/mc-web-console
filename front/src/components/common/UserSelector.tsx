'use client';

import { Button } from './Button';
import { Search, X, Check } from 'lucide-react';
import { useUsers } from '@/hooks/api/useUsers';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { UserInfo } from '@/types/auth';

interface UserSelectorProps {
  value: UserInfo[];
  onChange: (users: UserInfo[]) => void;
  multiple?: boolean;
  className?: string;
}

export function UserSelector({
  value,
  onChange,
  multiple = false,
  className,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { users, isLoading } = useUsers({ search: searchQuery });

  const handleSelect = (user: UserInfo) => {
    if (multiple) {
      const isSelected = value.some((u) => u.id === user.id);
      if (isSelected) {
        onChange(value.filter((u) => u.id !== user.id));
      } else {
        onChange([...value, user]);
      }
    } else {
      onChange([user]);
      setOpen(false);
    }
  };

  const handleRemove = (userId: string) => {
    onChange(value.filter((u) => u.id !== userId));
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            사용자 검색
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="사용자 검색..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  로딩 중...
                </div>
              ) : (
                <>
                  <CommandEmpty>사용자를 찾을 수 없습니다.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => {
                      const isSelected = value.some((u) => u.id === user.id);
                      return (
                        <CommandItem
                          key={user.id}
                          onSelect={() => handleSelect(user)}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{user.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
            >
              <span>{user.username}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => handleRemove(user.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './Button';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ListCardItem {
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, string>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

interface ListCardProps {
  title: string;
  items: ListCardItem[];
  emptyMessage?: string;
  className?: string;
}

export function ListCard({
  title,
  items,
  emptyMessage = '항목이 없습니다.',
  className,
}: ListCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                  {item.metadata && (
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <span key={key}>
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {item.actions && item.actions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.actions.map((action, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={action.onClick}
                          className={cn(
                            action.variant === 'destructive' && 'text-destructive'
                          )}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

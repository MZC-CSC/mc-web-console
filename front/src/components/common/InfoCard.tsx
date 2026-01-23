'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './Button';
import { Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  editable?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function InfoCard({
  title,
  children,
  editable = false,
  onSave,
  onCancel,
  className,
}: InfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave?.();
    setIsEditing(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setIsEditing(false);
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {editable && !isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {editable && isEditing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(isEditing && 'space-y-4')}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

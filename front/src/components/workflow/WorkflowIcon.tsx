'use client';

import Image from 'next/image';

export type WorkflowIconType = 'save' | 'text' | 'filter' | 'if' | 'loop' | 'task';

export interface WorkflowIconProps {
  type: WorkflowIconType;
  size?: number;
  className?: string;
}

export function WorkflowIcon({ type, size = 20, className = '' }: WorkflowIconProps) {
  return (
    <Image
      src={`/images/workflow/${type}.svg`}
      alt={type}
      width={size}
      height={size}
      className={className}
    />
  );
}

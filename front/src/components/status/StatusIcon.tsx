'use client';

import Image from 'next/image';

export type ServerStatus = 'running' | 'stop' | 'terminate' | 'off';

export interface StatusIconProps {
  status: ServerStatus;
  size?: number;
  className?: string;
}

export function StatusIcon({ status, size = 16, className = '' }: StatusIconProps) {
  return (
    <Image
      src={`/images/status/${status}.svg`}
      alt={status}
      width={size}
      height={size}
      className={className}
    />
  );
}

'use client';

import Image from 'next/image';

export type Provider = 'aws' | 'azure' | 'gcp' | 'alibaba' | 'tencent' | 'ncpvpc' | 'mcmp';

export interface ProviderLogoProps {
  provider: Provider | string;
  size?: number;
  className?: string;
}

const VALID_PROVIDERS = ['aws', 'azure', 'gcp', 'alibaba', 'tencent', 'ncpvpc', 'mcmp'];

export function ProviderLogo({ provider, size = 24, className = '' }: ProviderLogoProps) {
  const providerLower = provider.toLowerCase();
  const isValid = VALID_PROVIDERS.includes(providerLower);

  if (!isValid) {
    return null;
  }

  return (
    <Image
      src={`/images/providers/${providerLower}.png`}
      alt={provider.toUpperCase()}
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}

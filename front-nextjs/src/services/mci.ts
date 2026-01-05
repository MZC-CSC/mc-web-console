/**
 * MCI API Service
 */

import { apiClient } from '@/lib/api/client';
import type {
  MCI,
  MCISummary,
  MciControlAction,
  CreateMciRequest,
  MciDisplayStatus,
} from '@/types/mci';

const SUBSYSTEM = 'mc-infra-manager';

/**
 * Get all MCIs for a namespace
 */
export async function getMciList(nsId: string): Promise<MCI[]> {
  if (!nsId) {
    console.warn('Namespace ID is required');
    return [];
  }

  try {
    const response = await apiClient.post<MCI[]>(SUBSYSTEM, 'GetAllMci', {
      pathParams: { nsId },
    });

    return response.responseData || [];
  } catch (error: unknown) {
    // 404 is normal when no MCIs exist
    if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Get a single MCI by ID
 */
export async function getMci(nsId: string, mciId: string): Promise<MCI | null> {
  if (!nsId || !mciId) {
    console.warn('Namespace ID and MCI ID are required');
    return null;
  }

  try {
    const response = await apiClient.post<MCI>(SUBSYSTEM, 'GetMci', {
      pathParams: { nsId, mciId },
    });

    return response.responseData || null;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Control MCI lifecycle (reboot, suspend, resume, terminate)
 */
export async function controlMci(
  nsId: string,
  mciId: string,
  action: MciControlAction
): Promise<unknown> {
  if (!nsId || !mciId) {
    throw new Error('Namespace ID and MCI ID are required');
  }

  const response = await apiClient.post(SUBSYSTEM, 'GetControlMci', {
    pathParams: { nsId, mciId },
    queryParams: { action },
  });

  return response;
}

/**
 * Delete an MCI
 */
export async function deleteMci(nsId: string, mciId: string): Promise<unknown> {
  if (!nsId || !mciId) {
    throw new Error('Namespace ID and MCI ID are required');
  }

  const response = await apiClient.post(SUBSYSTEM, 'Delmci', {
    pathParams: { nsId, mciId },
    queryParams: { option: 'force' },
  });

  return response;
}

/**
 * Create MCI dynamically
 */
export async function createMciDynamic(
  nsId: string,
  request: CreateMciRequest
): Promise<MCI> {
  if (!nsId) {
    throw new Error('Namespace ID is required');
  }

  const response = await apiClient.post<MCI>(SUBSYSTEM, 'PostMciDynamic', {
    pathParams: { nsId },
    request: request,
  });

  return response.responseData;
}

/**
 * Get MCI status as display format
 */
export function getMciStatusDisplay(status: string): MciDisplayStatus {
  if (!status || typeof status !== 'string') {
    return 'etc';
  }

  const lowerStatus = status.toLowerCase();

  // Partial status
  if (lowerStatus.includes('partial')) {
    return 'etc';
  }

  // Running states
  if (lowerStatus.includes('running')) {
    return 'running';
  }
  if (
    lowerStatus.includes('creating') ||
    lowerStatus.includes('rebooting') ||
    lowerStatus.includes('resuming')
  ) {
    return 'running-ing';
  }

  // Stopped states
  if (lowerStatus.includes('suspended')) {
    return 'stopped';
  }
  if (lowerStatus.includes('suspending')) {
    return 'stopped-ing';
  }

  // Terminated states
  if (lowerStatus.includes('terminated')) {
    return 'terminated';
  }
  if (lowerStatus.includes('terminating')) {
    return 'terminated-ing';
  }

  // Failed state
  if (lowerStatus.includes('failed')) {
    return 'failed';
  }

  return 'etc';
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(
  displayStatus: MciDisplayStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (displayStatus) {
    case 'running':
      return 'default';
    case 'running-ing':
    case 'stopped-ing':
    case 'terminated-ing':
      return 'secondary';
    case 'stopped':
    case 'terminated':
      return 'outline';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Calculate VM count by provider
 */
export function calculateProviderCount(mci: MCI): Map<string, number> {
  const providerMap = new Map<string, number>();

  if (!mci.vm || !Array.isArray(mci.vm)) {
    return providerMap;
  }

  for (const vm of mci.vm) {
    const provider = vm.connectionConfig?.providerName || 'unknown';
    providerMap.set(provider, (providerMap.get(provider) || 0) + 1);
  }

  return providerMap;
}

export const mciService = {
  getMciList,
  getMci,
  controlMci,
  deleteMci,
  createMciDynamic,
  getMciStatusDisplay,
  getStatusBadgeVariant,
  calculateProviderCount,
};

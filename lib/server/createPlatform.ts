'use server';

import {db} from '@/db/client';
import {platforms} from '@/db/schema';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';

export type CreatePlatformResult = CreateActionResult;

type CreatePlatformInput = {
  name: string;
  image: string;
  link: string;
  description: string | null;
  logoScale: number | null;
  logoTranslateY: number | null;
};

function normalizeRedirectPath(path: string): string {
  return path.trim().replace(/^\/+/, '');
}

function isSafeRedirectPath(path: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/i.test(path);
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function validateInput(input: CreatePlatformInput): string | null {
  if (!input.name.trim()) return 'Název je povinný';
  if (!input.image.trim()) return 'Logo je povinné';
  const normalizedLink = normalizeRedirectPath(input.link);
  if (!normalizedLink) return 'Odkaz je povinný';
  if (!isSafeRedirectPath(normalizedLink)) {
    return 'Odkaz musí být platný redirect path ve formátu slug nebo /slug';
  }
  if (input.logoScale !== null && !isFiniteNumber(input.logoScale)) {
    return 'Scale loga musí být platné číslo';
  }
  if (input.logoScale !== null && input.logoScale <= 0) {
    return 'Scale loga musí být větší než 0';
  }
  if (input.logoTranslateY !== null && !isFiniteNumber(input.logoTranslateY)) {
    return 'Posun loga na ose Y musí být platné číslo';
  }
  if (
    input.logoTranslateY !== null &&
    !Number.isInteger(input.logoTranslateY)
  ) {
    return 'Posun loga na ose Y musí být celé číslo';
  }

  return null;
}

export async function createPlatform(
  input: CreatePlatformInput,
): Promise<CreatePlatformResult> {
  return runCreateRecordAction({
    actionName: 'createPlatform',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit platformu.',
    validate: validateInput,
    executeInsert: async ({input: raw, userId}) => {
      await db.insert(platforms).values({
        name: raw.name.trim(),
        image: raw.image.trim(),
        link: normalizeRedirectPath(raw.link),
        description: raw.description?.trim() || null,
        logoScale: raw.logoScale,
        logoTranslateY: raw.logoTranslateY,
        createdBy: userId,
        updatedBy: userId,
      });
    },
    revalidatePaths: ['/admin/platformy', '/'],
    constraintErrors: [
      {
        includes: 'platforms_name_idx',
        message: 'Platforma se stejným názvem již existuje.',
      },
    ],
  });
}

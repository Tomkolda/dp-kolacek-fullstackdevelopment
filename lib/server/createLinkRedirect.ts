'use server';

import {db} from '@/db/client';
import {linkRedirector} from '@/db/schema';
import {
  type CreateActionResult,
  runCreateRecordAction,
} from '@/lib/server/createRecord';
import {
  normalizeLinkRedirectPath,
  validateLinkRedirectPath,
} from '@/lib/utils/linkRedirector';
import {isHttpUrl} from '@/lib/utils/url';

export type CreateLinkRedirectResult = CreateActionResult;

type CreateLinkRedirectInput = {
  path: string;
  target: string;
  title: string;
  description: string | null;
};

function validateCreateLinkRedirectInput(
  input: CreateLinkRedirectInput,
): string | null {
  const pathError = validateLinkRedirectPath(input.path);
  if (pathError) return pathError;

  if (!input.title.trim()) return 'Název je povinný.';

  const target = input.target.trim();
  if (!target) return 'Cílová URL je povinná.';
  if (!isHttpUrl(target)) {
    return 'Cílová URL musí být platná adresa s protokolem http/https.';
  }

  return null;
}

export async function createLinkRedirect(
  input: CreateLinkRedirectInput,
): Promise<CreateLinkRedirectResult> {
  return runCreateRecordAction({
    actionName: 'createLinkRedirect',
    input,
    genericErrorMessage: 'Nepodařilo se vytvořit redirect.',
    validate: validateCreateLinkRedirectInput,
    executeInsert: async ({input: raw, userId}) => {
      await db.insert(linkRedirector).values({
        path: normalizeLinkRedirectPath(raw.path),
        target: raw.target.trim(),
        title: raw.title.trim(),
        description: raw.description?.trim() || null,
        createdBy: userId,
        updatedBy: userId,
      });
    },
    revalidatePaths: ['/admin/link-redirector'],
    constraintErrors: [
      {
        includes: 'link_redirector_path_uidx',
        message: 'Redirect se stejnou cestou již existuje.',
      },
    ],
  });
}

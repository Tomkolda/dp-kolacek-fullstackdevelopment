'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {linkRedirector} from '@/db/schema';
import {
  runUpdateRecordAction,
  type UpdateActionResult,
} from '@/lib/server/updateRecord';
import {
  normalizeLinkRedirectPath,
  validateLinkRedirectPath,
} from '@/lib/utils/linkRedirector';
import {isHttpUrl} from '@/lib/utils/url';

export type UpdateLinkRedirectResult = UpdateActionResult;

type UpdateLinkRedirectInput = {
  path: string;
  target: string;
  title: string;
  description: string | null;
};

function validateUpdateLinkRedirectInput(
  input: UpdateLinkRedirectInput,
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

export async function updateLinkRedirect(
  id: number,
  input: UpdateLinkRedirectInput,
): Promise<UpdateLinkRedirectResult> {
  return runUpdateRecordAction({
    actionName: 'updateLinkRedirect',
    id,
    input,
    genericErrorMessage: 'Nepodařilo se upravit redirect.',
    notFoundErrorMessage: 'Redirect nebyl nalezen.',
    validate: validateUpdateLinkRedirectInput,
    executeUpdate: async ({id: redirectId, input: raw, userId}) => {
      const updatedRows = await db
        .update(linkRedirector)
        .set({
          path: normalizeLinkRedirectPath(raw.path),
          target: raw.target.trim(),
          title: raw.title.trim(),
          description: raw.description?.trim() || null,
          updatedBy: userId,
        })
        .returning({id: linkRedirector.id})
        .where(eq(linkRedirector.id, redirectId));

      return updatedRows.length;
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

'use server';

import {eq} from 'drizzle-orm';

import {db} from '@/db/client';
import * as schema from '@/db/schema';
import {getUser} from '@/lib/server/getUser';

type TableName = keyof typeof schema;
type ToggleArchiveResult = {success: true} | {success: false; error: string};

/** Sets or clears `archivedAt` on a record in the given table. */
export async function toggleArchive(
  tableName: TableName,
  id: number,
  archive: boolean,
): Promise<ToggleArchiveResult> {
  try {
    const {user, error: authError} = await getUser();
    if (authError || !user) {
      return {success: false, error: 'Neautorizovaný přístup'};
    }

    const table = schema[tableName];
    if (!('archivedAt' in table)) {
      return {success: false, error: 'Záznam nepodporuje archivaci'};
    }

    await db
      .update(table)
      .set({
        archivedAt: archive ? new Date() : null,
        updatedBy: user.id,
      })
      .where(eq(table.id, id));

    return {success: true};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[toggleArchive] Failed:', error);
    return {success: false, error: 'Neočekávaná chyba'};
  }
}

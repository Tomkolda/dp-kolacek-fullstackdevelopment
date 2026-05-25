'use server';

import {sql} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';

import {db} from '@/db/client';
import {webItems} from '@/db/schema';
import type {WebItemKey, WebItemValueOf} from '@/db/types';
import {createClient} from '@/lib/supabase/server';

type UpsertWebItemResult = {success: true} | {success: false; error: string};

type UpsertWebItemInput<K extends WebItemKey> = {
  key: K;
  value: WebItemValueOf<K>;
};

export async function upsertWebItem<K extends WebItemKey>(
  input: UpsertWebItemInput<K>,
): Promise<UpsertWebItemResult> {
  if (input.value.type !== input.key) {
    return {success: false, error: 'Neplatná kombinace klíče a hodnoty.'};
  }
  const supabase = await createClient();
  const {data, error: authError} = await supabase.auth.getUser();
  if (authError || !data.user) {
    return {success: false, error: 'Nepřihlášený uživatel.'};
  }

  const userId = data.user.id;

  try {
    await db
      .insert(webItems)
      .values({
        key: input.key,
        value: input.value,
        createdBy: userId,
        updatedBy: userId,
      })
      .onConflictDoUpdate({
        target: webItems.key,
        targetWhere: sql`${webItems.archivedAt} IS NULL`,
        set: {
          value: input.value,
          updatedBy: userId,
        },
      });

    revalidatePath('/admin/nastaveni-webu');
    revalidatePath('/');

    return {success: true};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[upsertWebItem] Failed:', error);
    return {success: false, error: 'Nepodařilo se uložit nastavení.'};
  }
}

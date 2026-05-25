'use server';

import {asc} from 'drizzle-orm';

import {db} from '@/db/client';
import {members} from '@/db/schema';
import type {DBMember} from '@/db/types';

/**
 * Fetches all band members for admin purposes, including archived ones.
 * Results are ordered by manual order and then by name.
 */
export async function getMembersAdmin(): Promise<DBMember[]> {
  try {
    return await db
      .select()
      .from(members)
      .orderBy(asc(members.order), asc(members.name));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getMembersAdmin] Failed to fetch members:', error);
    return [];
  }
}

'use server';

import {desc, eq} from 'drizzle-orm';

import {db} from '@/db/client';
import {orders} from '@/db/schema';
import type {DBOrder} from '@/db/types';

export async function getOrdersAdmin(): Promise<DBOrder[]> {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getOrdersAdmin] Failed to fetch orders:', error);
    return [];
  }
}

export async function getOrderAdmin(orderId: number): Promise<DBOrder | null> {
  try {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getOrderAdmin] Failed to fetch order:', error);
    return null;
  }
}

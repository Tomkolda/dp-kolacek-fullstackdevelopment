'use server';

import {eq, sql} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';

import {db} from '@/db/client';
import {orders} from '@/db/schema';
import {
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  type OrderPaymentLogEntry,
  type OrderPaymentStatus,
  type OrderStatus,
} from '@/db/types';
import {getUser} from '@/lib/server/getUser';

type UpdateOrderStatusResult =
  | {success: true}
  | {success: false; error: string};

export async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  try {
    const {user, error: authError} = await getUser();
    if (authError || !user) {
      return {success: false, error: 'Neautorizovaný přístup'};
    }

    if (!ORDER_STATUSES.includes(newStatus)) {
      return {success: false, error: 'Neplatný stav objednávky'};
    }

    const logEntry = JSON.stringify({
      status: newStatus,
      changedBy: user.id,
      changedAt: new Date().toISOString(),
    });

    const result = await db
      .update(orders)
      .set({
        status: newStatus,
        statusLog: sql`coalesce(${orders.statusLog}, '[]'::jsonb) || ${logEntry}::jsonb`,
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(orders.id, orderId))
      .returning({id: orders.id});

    if (result.length === 0) {
      return {success: false, error: 'Objednávka nenalezena'};
    }

    revalidatePath('/admin/merch/objednavky');
    return {success: true};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateOrderStatus] Failed:', error);
    return {success: false, error: 'Neočekávaná chyba'};
  }
}

export async function updateOrderPaymentStatus(
  orderId: number,
  newPaymentStatus: OrderPaymentStatus,
): Promise<UpdateOrderStatusResult> {
  try {
    const {user, error: authError} = await getUser();
    if (authError || !user) {
      return {success: false, error: 'Neautorizovaný přístup'};
    }

    if (!ORDER_PAYMENT_STATUSES.includes(newPaymentStatus)) {
      return {success: false, error: 'Neplatný stav platby'};
    }

    const actionMap: Record<
      OrderPaymentStatus,
      OrderPaymentLogEntry['action']
    > = {
      pending: 'payment_reset',
      paid: 'payment_confirmed',
      refunded: 'payment_refunded',
    };

    const logEntry: OrderPaymentLogEntry = {
      action: actionMap[newPaymentStatus],
      performedBy: user.id,
      performedAt: new Date().toISOString(),
    };

    const logEntryJson = JSON.stringify(logEntry);

    const result = await db
      .update(orders)
      .set({
        paymentStatus: newPaymentStatus,
        paymentLog: sql`coalesce(${orders.paymentLog}, '[]'::jsonb) || ${logEntryJson}::jsonb`,
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(orders.id, orderId))
      .returning({id: orders.id});

    if (result.length === 0) {
      return {success: false, error: 'Objednávka nenalezena'};
    }

    revalidatePath('/admin/merch/objednavky');
    return {success: true};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateOrderPaymentStatus] Failed:', error);
    return {success: false, error: 'Neočekávaná chyba'};
  }
}

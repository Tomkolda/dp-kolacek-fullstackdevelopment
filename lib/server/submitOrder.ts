'use server';

import {db} from '@/db/client';
import {orders} from '@/db/schema';

import {parseOrderPayload, sendOrderEmail} from './orderEmail';

const ANONYMOUS_UUID = '00000000-0000-0000-0000-000000000000';

type SubmitOrderResult =
  | {success: true; warning?: string}
  | {success: false; error: string};

export async function submitOrder(raw: unknown): Promise<SubmitOrderResult> {
  const body = parseOrderPayload(raw);

  if (!body) {
    return {success: false, error: 'Neplatný formát dat'};
  }
  if (!body.customerName.trim()) {
    return {success: false, error: 'Jméno je povinné'};
  }

  const email = body.email.trim();
  if (
    !email ||
    /[,;<>]/.test(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return {success: false, error: 'Neplatný email'};
  }

  if (!body.phone.trim()) {
    return {success: false, error: 'Telefon je povinný'};
  }

  if (body.deliveryMethod !== 'in_person') {
    if (!body.street?.trim()) {
      return {success: false, error: 'Ulice je povinná'};
    }
    if (!body.city?.trim()) {
      return {success: false, error: 'Město je povinné'};
    }
    if (!body.postalCode?.trim()) {
      return {success: false, error: 'PSČ je povinné'};
    }
  }

  if (
    (body.deliveryMethod === 'pickup_point' || body.deliveryMethod === 'box') &&
    !body.pickupLocation?.trim()
  ) {
    return {success: false, error: 'Název místa je povinný'};
  }

  if (body.items.length === 0) {
    return {success: false, error: 'Objednávka neobsahuje žádné položky'};
  }

  try {
    await sendOrderEmail({...body, email});
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to send order email:', err);
    return {success: false, error: 'Nepodařilo se odeslat email'};
  }

  try {
    await db.insert(orders).values({
      customerName: body.customerName.trim(),
      email,
      phone: body.phone.trim(),
      street: body.street?.trim() || null,
      city: body.city?.trim() || null,
      postalCode: body.postalCode?.trim() || null,
      deliveryMethod: body.deliveryMethod,
      pickupLocation: body.pickupLocation?.trim() || null,
      items: body.items,
      note: body.note?.trim() || null,
      updatedBy: ANONYMOUS_UUID,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Email sent but failed to save order to DB:', err);
    return {
      success: true,
      warning:
        'Email odeslán, ale nepodařilo se uložit objednávku do databáze.',
    };
  }

  return {success: true};
}

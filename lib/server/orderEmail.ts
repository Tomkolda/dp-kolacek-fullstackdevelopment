import nodemailer from 'nodemailer';

import {
  ORDER_DELIVERY_METHODS,
  type OrderDeliveryMethod,
  type OrderItem,
} from '@/db/types';
import {ORDER_DELIVERY_METHOD_EMAIL_LABELS} from '@/lib/utils/orderLabels';

export type OrderPayload = {
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: OrderDeliveryMethod;
  street?: string;
  city?: string;
  postalCode?: string;
  pickupLocation?: string;
  note?: string;
  items: OrderItem[];
};

function isValidItem(item: unknown): item is OrderItem {
  if (typeof item !== 'object' || item === null) return false;
  const o = item as Record<string, unknown>;
  return (
    typeof o.productId === 'number' &&
    typeof o.productTitle === 'string' &&
    typeof o.variantLabel === 'string' &&
    typeof o.priceCzk === 'number' &&
    Number.isFinite(o.priceCzk) &&
    typeof o.quantity === 'number' &&
    Number.isFinite(o.quantity) &&
    o.quantity > 0
  );
}

const VALID_DELIVERY_METHODS: ReadonlySet<string> = new Set(
  ORDER_DELIVERY_METHODS,
);

export function parseOrderPayload(raw: unknown): OrderPayload | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.customerName !== 'string') return null;
  if (typeof o.email !== 'string') return null;
  if (typeof o.phone !== 'string') return null;
  if (typeof o.deliveryMethod !== 'string') return null;
  if (!VALID_DELIVERY_METHODS.has(o.deliveryMethod)) return null;
  if (!Array.isArray(o.items) || !o.items.every(isValidItem)) return null;

  return {
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    deliveryMethod: o.deliveryMethod as OrderDeliveryMethod,
    street: typeof o.street === 'string' ? o.street : undefined,
    city: typeof o.city === 'string' ? o.city : undefined,
    postalCode: typeof o.postalCode === 'string' ? o.postalCode : undefined,
    pickupLocation:
      typeof o.pickupLocation === 'string' ? o.pickupLocation : undefined,
    note: typeof o.note === 'string' ? o.note : undefined,
    items: o.items,
  };
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(order: OrderPayload): string {
  const totalPrice = order.items.reduce(
    (sum, item) => sum + item.priceCzk * item.quantity,
    0,
  );

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(item.productTitle)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(item.variantLabel)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.priceCzk * item.quantity).toLocaleString('cs-CZ')} Kč</td>
      </tr>`,
    )
    .join('');

  const addressBlock =
    order.deliveryMethod !== 'in_person'
      ? `
        <tr><td style="padding: 4px 8px; font-weight: bold;">Ulice:</td><td style="padding: 4px 8px;">${esc(order.street || '—')}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Město:</td><td style="padding: 4px 8px;">${esc(order.city || '—')}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">PSČ:</td><td style="padding: 4px 8px;">${esc(order.postalCode || '—')}</td></tr>`
      : '';

  const pickupBlock = order.pickupLocation
    ? `<tr><td style="padding: 4px 8px; font-weight: bold;">Místo vyzvednutí:</td><td style="padding: 4px 8px;">${esc(order.pickupLocation)}</td></tr>`
    : '';

  const noteBlock = order.note?.trim()
    ? `<h3>Poznámka</h3><p style="padding: 4px 8px;">${esc(order.note)}</p>`
    : '';

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nová objednávka z Free Fall merch</h2>

      <h3>Kontaktní údaje</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 8px; font-weight: bold;">Jméno:</td><td style="padding: 4px 8px;">${esc(order.customerName)}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Email:</td><td style="padding: 4px 8px;">${esc(order.email)}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Telefon:</td><td style="padding: 4px 8px;">${esc(order.phone)}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Doručení:</td><td style="padding: 4px 8px;">${esc(ORDER_DELIVERY_METHOD_EMAIL_LABELS[order.deliveryMethod])}</td></tr>
        ${addressBlock}
        ${pickupBlock}
      </table>

      ${noteBlock}

      <h3>Objednané položky</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; text-align: left;">Produkt</th>
            <th style="padding: 8px; text-align: left;">Varianta</th>
            <th style="padding: 8px; text-align: center;">Ks</th>
            <th style="padding: 8px; text-align: right;">Cena</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; font-weight: bold;">Celkem</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">${totalPrice.toLocaleString('cs-CZ')} Kč</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

//TODO: change on production
const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 64325,
  secure: false,
  tls: {rejectUnauthorized: false},
});
//TODO: change on production
export async function sendOrderEmail(order: OrderPayload): Promise<void> {
  await transporter.sendMail({
    from: `"Free Fall Merch" <merch@freefall.cz>`,
    to: 'objednavky@freefall.cz',
    replyTo: order.email,
    subject: `Nová objednávka – ${order.customerName.trim()}`,
    html: buildHtml(order),
  });
}

import {
  ORDER_DELIVERY_METHODS,
  type OrderDeliveryMethod,
  type OrderPaymentLogEntry,
  type OrderPaymentStatus,
  type OrderStatus,
} from '@/db/types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Nová',
  processing: 'Zpracovává se',
  shipped: 'Odesláno',
  delivered: 'Doručeno',
  cancelled: 'Zrušeno',
};

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  pending: 'Čeká na platbu',
  paid: 'Zaplaceno',
  refunded: 'Vráceno',
};

export const ORDER_PAYMENT_ACTION_LABELS: Record<
  OrderPaymentLogEntry['action'],
  string
> = {
  payment_confirmed: 'Platba označena jako zaplacená',
  payment_refunded: 'Platba označena jako vrácená',
  payment_reset: 'Platba vrácena do stavu čeká na platbu',
};

export const ORDER_DELIVERY_METHOD_LABELS: Record<OrderDeliveryMethod, string> =
  {
    address: 'Na adresu',
    in_person: 'Osobně',
    box: 'Zásilkovna',
    pickup_point: 'Výdejní místo',
  };

export const ORDER_DELIVERY_METHOD_EMAIL_LABELS: Record<
  OrderDeliveryMethod,
  string
> = {
  address: 'Doručení na adresu',
  in_person: 'Osobní předání',
  box: 'Zásilkovna / Box',
  pickup_point: 'Výdejní místo',
};

export const ORDER_DELIVERY_METHOD_OPTIONS = ORDER_DELIVERY_METHODS.map(
  (value) => ({
    value,
    label: ORDER_DELIVERY_METHOD_LABELS[value],
  }),
);

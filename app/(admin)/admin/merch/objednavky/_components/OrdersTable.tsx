'use client';

import {Badge, Box, Button, Group, Menu, Text, Tooltip} from '@mantine/core';
import {notifications} from '@mantine/notifications';
import {IconChevronDown} from '@tabler/icons-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useCallback, useMemo, useState} from 'react';

import {AdminTable, type ColumnDef} from '@/components/shared/AdminTable';
import {
  type DBOrder,
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  type OrderItem,
  type OrderPaymentStatus,
  type OrderStatus,
} from '@/db/types';
import {
  updateOrderPaymentStatus,
  updateOrderStatus,
} from '@/lib/server/updateOrderStatus';
import {timestampFromDB} from '@/lib/utils/datetime';
import {
  ORDER_DELIVERY_METHOD_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
} from '@/lib/utils/orderLabels';

const ALL_ORDER_STATUSES = ORDER_STATUSES;
const ALL_PAYMENT_STATUSES = ORDER_PAYMENT_STATUSES;

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(date: Date | null | undefined): string {
  const dt = timestampFromDB(date);
  if (!dt) return '—';
  return dt.setLocale('cs').toFormat('dd. MM. yyyy HH:mm');
}

function formatItems(items: OrderItem[]): string {
  if (!items || items.length === 0) return '—';
  return items.map((i) => `${i.variantLabel} ×${i.quantity}`).join(', ');
}

// ── Component ───────────────────────────────────────────────────────────────

type OrdersTableProps = {
  orders: DBOrder[];
};

export function OrdersTable({orders}: OrdersTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<OrderPaymentStatus | null>(
    null,
  );

  const handleStatusChange = useCallback(
    (orderId: number, newStatus: OrderStatus) => {
      setPendingId(orderId);
      void (async () => {
        try {
          const result = await updateOrderStatus(orderId, newStatus);
          if (result.success) {
            router.refresh();
            return;
          }
          notifications.show({
            title: 'Chyba',
            message: result.error,
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Nepodařilo se změnit stav objednávky.',
            color: 'red',
          });
        } finally {
          setPendingId(null);
        }
      })();
    },
    [router],
  );

  const handlePaymentStatusChange = useCallback(
    (orderId: number, newStatus: OrderPaymentStatus) => {
      setPendingId(orderId);
      void (async () => {
        try {
          const result = await updateOrderPaymentStatus(orderId, newStatus);
          if (result.success) {
            router.refresh();
            return;
          }
          notifications.show({
            title: 'Chyba',
            message: result.error,
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Nepodařilo se změnit stav platby.',
            color: 'red',
          });
        } finally {
          setPendingId(null);
        }
      })();
    },
    [router],
  );

  const columns: Array<ColumnDef<DBOrder>> = useMemo(
    () => [
      {
        key: 'id',
        header: '#',
        render: (order) => (
          <Text size="sm" fw={600}>
            {order.id}
          </Text>
        ),
        sortable: true,
        sortFn: (a, b) => a.id - b.id,
      },
      {
        key: 'createdAt',
        header: 'Datum',
        render: (order) => (
          <Text size="sm">{formatTimestamp(order.createdAt)}</Text>
        ),
        sortable: true,
        sortFn: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      },
      {
        key: 'customerName',
        header: 'Zákazník',
        render: (order) => (
          <Tooltip label={order.email}>
            <Text size="sm" fw={500}>
              {order.customerName}
            </Text>
          </Tooltip>
        ),
        sortable: true,
        sortFn: (a, b) => a.customerName.localeCompare(b.customerName, 'cs'),
        searchValue: (order) =>
          `${order.customerName} ${order.email} ${order.phone ?? ''}`,
      },
      {
        key: 'items',
        header: 'Položky',
        render: (order) => (
          <Text size="sm" lineClamp={2} maw={250}>
            {formatItems(order.items)}
          </Text>
        ),
      },
      {
        key: 'delivery',
        header: 'Doručení',
        render: (order) => (
          <Text size="sm">
            {ORDER_DELIVERY_METHOD_LABELS[order.deliveryMethod] ??
              order.deliveryMethod}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Stav',
        render: (order) => (
          <Menu shadow="md" width={180} withinPortal>
            <Menu.Target>
              <Badge
                component="button"
                variant="default"
                size="lg"
                style={{cursor: 'pointer'}}
                rightSection={<IconChevronDown size={12} />}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Změnit stav objednávky</Menu.Label>
              {ALL_ORDER_STATUSES.map((s) => (
                <Menu.Item
                  key={s}
                  disabled={s === order.status || pendingId === order.id}
                  onClick={() => handleStatusChange(order.id, s)}>
                  {ORDER_STATUS_LABELS[s]}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        ),
        sortable: true,
        sortFn: (a, b) =>
          ALL_ORDER_STATUSES.indexOf(a.status) -
          ALL_ORDER_STATUSES.indexOf(b.status),
      },
      {
        key: 'paymentStatus',
        header: 'Platba',
        render: (order) => (
          <Menu shadow="md" width={180} withinPortal>
            <Menu.Target>
              <Badge
                component="button"
                variant="default"
                size="lg"
                style={{cursor: 'pointer'}}
                rightSection={<IconChevronDown size={12} />}>
                {ORDER_PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </Badge>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Změnit stav platby</Menu.Label>
              {ALL_PAYMENT_STATUSES.map((s) => (
                <Menu.Item
                  key={s}
                  disabled={s === order.paymentStatus || pendingId === order.id}
                  onClick={() => handlePaymentStatusChange(order.id, s)}>
                  {ORDER_PAYMENT_STATUS_LABELS[s]}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        ),
        sortable: true,
        sortFn: (a, b) =>
          ALL_PAYMENT_STATUSES.indexOf(a.paymentStatus) -
          ALL_PAYMENT_STATUSES.indexOf(b.paymentStatus),
      },
      {
        key: 'detail',
        header: '',
        render: (order) => (
          <Button
            component={Link}
            href={`/admin/merch/objednavky/${order.id}`}
            size="xs"
            variant="subtle">
            Detail
          </Button>
        ),
      },
    ],
    [handleStatusChange, handlePaymentStatusChange, pendingId],
  );

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (paymentFilter) {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }
    return result;
  }, [orders, statusFilter, paymentFilter]);

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Text component="h2" size="1.5rem" fw={700}>
          Objednávky
        </Text>
      </Group>

      <Group gap="xs" mb="md">
        {ALL_ORDER_STATUSES.map((s) => (
          <Badge
            component="button"
            key={s}
            size="lg"
            variant={statusFilter === s ? 'filled' : 'default'}
            color={statusFilter === s ? 'dark' : undefined}
            style={{cursor: 'pointer'}}
            onClick={() => setStatusFilter((prev) => (prev === s ? null : s))}>
            {ORDER_STATUS_LABELS[s]}
          </Badge>
        ))}
        <Text size="sm" c="dimmed" mx="xs">
          |
        </Text>
        {ALL_PAYMENT_STATUSES.map((s) => (
          <Badge
            component="button"
            key={s}
            size="lg"
            variant={paymentFilter === s ? 'filled' : 'default'}
            color={paymentFilter === s ? 'dark' : undefined}
            style={{cursor: 'pointer'}}
            onClick={() => setPaymentFilter((prev) => (prev === s ? null : s))}>
            {ORDER_PAYMENT_STATUS_LABELS[s]}
          </Badge>
        ))}
      </Group>

      <AdminTable
        data={filteredOrders}
        columns={columns}
        searchPlaceholder="Hledat podle jména..."
        defaultSort={{columnKey: 'createdAt', direction: 'desc'}}
        getRowKey={(order) => order.id}
        noun={{genitivePlural: 'objednávek'}}
        isArchived={(order) => order.status === 'cancelled'}
        emptyMessage="Žádné objednávky v databázi."
        noSearchResultsMessage="Žádné objednávky neodpovídají vyhledávání."
      />
    </Box>
  );
}

import {
  Anchor,
  Badge,
  Box,
  Card,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from '@mantine/core';
import {DateTime} from 'luxon';
import Link from 'next/link';
import type {ReactNode} from 'react';

import type {DBOrder} from '@/db/types';
import {timestampFromDB} from '@/lib/utils/datetime';
import {
  ORDER_DELIVERY_METHOD_LABELS,
  ORDER_PAYMENT_ACTION_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
} from '@/lib/utils/orderLabels';

type ChangeLogEntry = {
  key: string;
  type: 'status' | 'payment';
  title: string;
  actor: string;
  timestamp: string;
  sortValue: number;
};

type OrderDetailProps = {
  order: DBOrder;
  userNames: Record<string, string>;
};

function formatDbTimestamp(date: Date | null | undefined): string {
  const dt = timestampFromDB(date);
  if (!dt) return '—';
  return dt.setLocale('cs').toFormat('dd. MM. yyyy HH:mm');
}

function formatIsoTimestamp(value: string): string {
  const dt = DateTime.fromISO(value);
  if (!dt.isValid) return '—';
  return dt.setLocale('cs').toFormat('dd. MM. yyyy HH:mm');
}

function isoTimestampSortValue(value: string): number {
  const dt = DateTime.fromISO(value);
  return dt.isValid ? dt.toMillis() : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAddress(order: DBOrder): string {
  return [order.street, order.city, order.postalCode]
    .filter(Boolean)
    .join(', ');
}

function buildChangeLog(
  order: DBOrder,
  userNames: Record<string, string>,
): ChangeLogEntry[] {
  const statusEntries =
    order.statusLog?.map((entry, index) => ({
      key: `status-${index}-${entry.changedAt}`,
      type: 'status' as const,
      title: `Stav objednávky změněn na ${ORDER_STATUS_LABELS[entry.status]}`,
      actor: userNames[entry.changedBy] ?? entry.changedBy,
      timestamp: formatIsoTimestamp(entry.changedAt),
      sortValue: isoTimestampSortValue(entry.changedAt),
    })) ?? [];

  const paymentEntries =
    order.paymentLog?.map((entry, index) => ({
      key: `payment-${index}-${entry.performedAt}`,
      type: 'payment' as const,
      title:
        ORDER_PAYMENT_ACTION_LABELS[entry.action] ??
        `Změna platby: ${entry.action}`,
      actor: userNames[entry.performedBy] ?? entry.performedBy,
      timestamp: formatIsoTimestamp(entry.performedAt),
      sortValue: isoTimestampSortValue(entry.performedAt),
    })) ?? [];

  return [...statusEntries, ...paymentEntries].sort(
    (a, b) => b.sortValue - a.sortValue,
  );
}

function InfoCard({title, children}: {title: string; children: ReactNode}) {
  return (
    <Card withBorder radius="md" p="lg">
      <Title order={3} size="h4" mb="md">
        {title}
      </Title>
      <Stack gap="xs">{children}</Stack>
    </Card>
  );
}

function InfoRow({label, value}: {label: string; value: ReactNode}) {
  return (
    <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" ta="right">
        {value || '—'}
      </Text>
    </Group>
  );
}

export function OrderDetail({order, userNames}: OrderDetailProps) {
  const changeLog = buildChangeLog(order, userNames);
  const totalPrice = order.items.reduce(
    (sum, item) => sum + item.priceCzk * item.quantity,
    0,
  );
  const address = formatAddress(order);

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="xl" w="100%">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Link
                href="/admin/merch/objednavky"
                style={{
                  color: 'var(--mantine-color-myColor-6)',
                  display: 'inline-block',
                  marginBottom: 'var(--mantine-spacing-xs)',
                  textDecoration: 'none',
                }}>
                Zpět na objednávky
              </Link>
              <Title order={1}>Objednávka #{order.id}</Title>
              <Text c="dimmed" mt={4}>
                Vytvořeno {formatDbTimestamp(order.createdAt)}
              </Text>
            </Box>

            <Group gap="xs">
              <Badge size="lg" variant="default">
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <Badge size="lg" variant="default">
                {ORDER_PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </Badge>
            </Group>
          </Group>

          <SimpleGrid cols={{base: 1, md: 2}} spacing="lg">
            <InfoCard title="Zákazník">
              <InfoRow label="Jméno" value={order.customerName} />
              <InfoRow
                label="E-mail"
                value={
                  <Anchor href={`mailto:${order.email}`}>{order.email}</Anchor>
                }
              />
              <InfoRow
                label="Telefon"
                value={
                  order.phone ? (
                    <Anchor href={`tel:${order.phone}`}>{order.phone}</Anchor>
                  ) : (
                    '—'
                  )
                }
              />
            </InfoCard>

            <InfoCard title="Doručení">
              <InfoRow
                label="Způsob"
                value={ORDER_DELIVERY_METHOD_LABELS[order.deliveryMethod]}
              />
              <InfoRow label="Adresa" value={address || '—'} />
              <InfoRow label="Výdejní místo" value={order.pickupLocation} />
            </InfoCard>
          </SimpleGrid>

          <Card withBorder radius="md" p="lg">
            <Title order={2} size="h3" mb="md">
              Položky
            </Title>
            <TableScrollContainer minWidth={700}>
              <Table striped verticalSpacing="sm">
                <TableThead>
                  <TableTr>
                    <TableTh>Produkt</TableTh>
                    <TableTh>Varianta</TableTh>
                    <TableTh ta="right">Cena</TableTh>
                    <TableTh ta="right">Ks</TableTh>
                    <TableTh ta="right">Celkem</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {order.items.map((item) => (
                    <TableTr key={`${item.productId}-${item.variantLabel}`}>
                      <TableTd>{item.productTitle}</TableTd>
                      <TableTd>{item.variantLabel}</TableTd>
                      <TableTd ta="right">
                        {formatCurrency(item.priceCzk)}
                      </TableTd>
                      <TableTd ta="right">{item.quantity}</TableTd>
                      <TableTd ta="right">
                        {formatCurrency(item.priceCzk * item.quantity)}
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </TableScrollContainer>
            <Divider my="md" />
            <Group justify="flex-end">
              <Text fw={700}>Celkem {formatCurrency(totalPrice)}</Text>
            </Group>
          </Card>

          <SimpleGrid cols={{base: 1, md: 2}} spacing="lg">
            <InfoCard title="Poznámka">
              <Text size="sm" style={{whiteSpace: 'pre-wrap'}}>
                {order.note || '—'}
              </Text>
            </InfoCard>

            <InfoCard title="Systémové údaje">
              <InfoRow
                label="Vytvořeno"
                value={formatDbTimestamp(order.createdAt)}
              />
              <InfoRow
                label="Naposledy upraveno"
                value={formatDbTimestamp(order.updatedAt)}
              />
              <InfoRow
                label="Upravil"
                value={userNames[order.updatedBy] ?? order.updatedBy}
              />
            </InfoCard>
          </SimpleGrid>

          <Card withBorder radius="md" p="lg">
            <Title order={2} size="h3" mb="md">
              Log změn
            </Title>

            {changeLog.length === 0 ? (
              <Text c="dimmed">
                Zatím nejsou evidované žádné změny stavu objednávky ani platby.
              </Text>
            ) : (
              <TableScrollContainer minWidth={700}>
                <Table verticalSpacing="sm">
                  <TableThead>
                    <TableTr>
                      <TableTh>Čas</TableTh>
                      <TableTh>Typ</TableTh>
                      <TableTh>Změna</TableTh>
                      <TableTh>Uživatel</TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>
                    {changeLog.map((entry) => (
                      <TableTr key={entry.key}>
                        <TableTd>{entry.timestamp}</TableTd>
                        <TableTd>
                          <Badge variant="light">
                            {entry.type === 'status' ? 'Objednávka' : 'Platba'}
                          </Badge>
                        </TableTd>
                        <TableTd>{entry.title}</TableTd>
                        <TableTd>
                          <Text size="sm" c="dimmed">
                            {entry.actor}
                          </Text>
                        </TableTd>
                      </TableTr>
                    ))}
                  </TableTbody>
                </Table>
              </TableScrollContainer>
            )}
          </Card>
        </Stack>
      </Container>
    </Stack>
  );
}

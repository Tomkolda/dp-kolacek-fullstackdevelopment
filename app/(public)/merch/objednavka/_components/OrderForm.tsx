'use client';

import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconArrowLeft, IconSend} from '@tabler/icons-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {useCart} from '@/components/merch/CartProvider';
import type {OrderDeliveryMethod} from '@/db/types';
import {submitOrder} from '@/lib/server/submitOrder';
import {ORDER_DELIVERY_METHOD_OPTIONS} from '@/lib/utils/orderLabels';

function formatPrice(priceCzk: number): string {
  return `${priceCzk.toLocaleString('cs-CZ')} Kč`;
}

type FormValues = {
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: OrderDeliveryMethod;
  street: string;
  city: string;
  postalCode: string;
  pickupLocation: string;
  note: string;
};

export function OrderForm() {
  const {items, totalPrice, clearCart} = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      customerName: '',
      email: '',
      phone: '',
      deliveryMethod: 'address',
      street: '',
      city: '',
      postalCode: '',
      pickupLocation: '',
      note: '',
    },
    validate: {
      customerName: (v) => (v.trim().length < 2 ? 'Vyplňte jméno' : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Neplatný email'),
      phone: (v) => (v.trim().length < 6 ? 'Vyplňte telefon' : null),
      street: (v, values) =>
        values.deliveryMethod !== 'in_person' && v.trim().length < 2
          ? 'Vyplňte ulici'
          : null,
      city: (v, values) =>
        values.deliveryMethod !== 'in_person' && v.trim().length < 2
          ? 'Vyplňte město'
          : null,
      postalCode: (v, values) =>
        values.deliveryMethod !== 'in_person' && v.trim().length < 3
          ? 'Vyplňte PSČ'
          : null,
      pickupLocation: (v, values) =>
        (values.deliveryMethod === 'pickup_point' ||
          values.deliveryMethod === 'box') &&
        v.trim().length < 2
          ? 'Vyplňte název místa'
          : null,
    },
  });

  async function handleSubmit(values: FormValues) {
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      const result = await submitOrder({
        customerName: values.customerName,
        email: values.email,
        phone: values.phone,
        deliveryMethod: values.deliveryMethod,
        street: values.street || undefined,
        city: values.city || undefined,
        postalCode: values.postalCode || undefined,
        pickupLocation: values.pickupLocation || undefined,
        note: values.note || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          productTitle: item.productTitle,
          variantLabel: item.variantLabel,
          priceCzk: item.priceCzk,
          quantity: item.quantity,
        })),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.warning) {
        notifications.show({
          title: 'Objednávka odeslána s upozorněním',
          message: result.warning,
          color: 'yellow',
        });
      } else {
        notifications.show({
          title: 'Objednávka odeslána',
          message: 'Objednávka byla úspěšně odeslána. Brzy se vám ozveme.',
          color: 'green',
        });
      }

      clearCart();
      router.push('/merch');
    } catch (err) {
      notifications.show({
        title: 'Chyba',
        message:
          err instanceof Error
            ? err.message
            : 'Nepodařilo se odeslat objednávku',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <Text size="xl" fw={600}>
            Košík je prázdný
          </Text>
          <Text c="dimmed">
            Nemáte žádné položky k objednání. Vraťte se do obchodu.
          </Text>
          <Button component={Link} href="/merch" variant="light">
            Zpět na merch
          </Button>
        </Stack>
      </Container>
    );
  }

  const deliveryMethod = form.values.deliveryMethod;

  return (
    <Container size="sm" py="xl">
      <Button
        component={Link}
        href="/merch"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        mb="lg">
        Zpět na merch
      </Button>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Paper withBorder shadow="sm" radius="md" style={{overflow: 'hidden'}}>
          <Box px="md" pt="md" pb="sm" bg="var(--mantine-color-gray-light)">
            <Stack gap="xs">
              <Group gap="sm" wrap="nowrap" align="start">
                <Text size="sm" fw={500} w={70} mt={6}>
                  Od:
                </Text>
                <Box style={{flex: 1}}>
                  <Group gap="xs" grow>
                    <TextInput
                      placeholder="Jméno a příjmení"
                      size="sm"
                      {...form.getInputProps('customerName')}
                    />
                    <TextInput
                      placeholder="vas@email.cz"
                      type="email"
                      size="sm"
                      {...form.getInputProps('email')}
                    />
                  </Group>
                </Box>
              </Group>

              <Group gap="sm" wrap="nowrap" align="start">
                <Text size="sm" fw={500} w={70} mt={6}>
                  Telefon:
                </Text>
                <TextInput
                  placeholder="+420 123 456 789"
                  size="sm"
                  style={{flex: 1}}
                  {...form.getInputProps('phone')}
                />
              </Group>

              <Group gap="sm" wrap="nowrap" align="start">
                <Text size="sm" fw={500} w={70} mt={6}>
                  Doručení:
                </Text>
                <Box style={{flex: 1}}>
                  <SegmentedControl
                    data={ORDER_DELIVERY_METHOD_OPTIONS}
                    size="xs"
                    fullWidth
                    {...form.getInputProps('deliveryMethod')}
                  />
                </Box>
              </Group>

              {(deliveryMethod === 'pickup_point' ||
                deliveryMethod === 'box') && (
                <Group gap="sm" wrap="nowrap" align="start">
                  <Text size="sm" fw={500} w={70} mt={6}>
                    Název:
                  </Text>
                  <TextInput
                    placeholder={
                      deliveryMethod === 'box'
                        ? 'Název boxu'
                        : 'Název výdejního místa'
                    }
                    size="sm"
                    style={{flex: 1}}
                    {...form.getInputProps('pickupLocation')}
                  />
                </Group>
              )}

              {deliveryMethod !== 'in_person' && (
                <>
                  <Group gap="sm" wrap="nowrap" align="start">
                    <Text size="sm" fw={500} w={70} mt={6}>
                      Ulice:
                    </Text>
                    <TextInput
                      placeholder="Ulice 123"
                      size="sm"
                      style={{flex: 1}}
                      {...form.getInputProps('street')}
                    />
                  </Group>
                  <Group gap="sm" wrap="nowrap" align="start">
                    <Text size="sm" fw={500} w={70} mt={6}>
                      Město:
                    </Text>
                    <Box style={{flex: 1}}>
                      <Group gap="xs" grow>
                        <TextInput
                          placeholder="Praha"
                          size="sm"
                          {...form.getInputProps('city')}
                        />
                        <TextInput
                          placeholder="110 00"
                          size="sm"
                          {...form.getInputProps('postalCode')}
                        />
                      </Group>
                    </Box>
                  </Group>
                </>
              )}

              <Group gap="sm" wrap="nowrap">
                <Text size="sm" fw={500} w={70}>
                  Předmět:
                </Text>
                <Text size="sm" c="dimmed">
                  Objednávka merch – Free Fall
                </Text>
              </Group>
            </Stack>
          </Box>

          <Divider />

          <Box px="md" py="lg">
            <Text size="sm" mb="md">
              Dobrý den, mám zájem o následující položky:
            </Text>

            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              mb="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Produkt</Table.Th>
                  <Table.Th>Varianta</Table.Th>
                  <Table.Th ta="center">Ks</Table.Th>
                  <Table.Th ta="right">Cena</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item) => (
                  <Table.Tr key={`${item.productId}-${item.variantIndex}`}>
                    <Table.Td>{item.productTitle}</Table.Td>
                    <Table.Td>{item.variantLabel}</Table.Td>
                    <Table.Td ta="center">{item.quantity}</Table.Td>
                    <Table.Td ta="right">
                      {formatPrice(item.priceCzk * item.quantity)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td colSpan={3} fw={700}>
                    Celkem
                  </Table.Td>
                  <Table.Td ta="right" fw={700}>
                    {formatPrice(totalPrice)}
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            <Textarea
              label="Poznámka k objednávce"
              placeholder="Máte-li speciální požadavek, napište ho sem..."
              size="sm"
              minRows={2}
              autosize
              {...form.getInputProps('note')}
            />
          </Box>
        </Paper>

        <Button
          type="submit"
          size="lg"
          fullWidth
          mt="lg"
          leftSection={<IconSend size={20} />}
          loading={submitting}>
          Odeslat
        </Button>
      </form>
    </Container>
  );
}

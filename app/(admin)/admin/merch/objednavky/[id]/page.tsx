import {notFound} from 'next/navigation';

import {getOrderAdmin} from '@/lib/server/getOrdersAdmin';
import {getUserNameById} from '@/lib/utils/getUserNameById';

import {OrderDetail} from '../_components/OrderDetail';

type Order = NonNullable<Awaited<ReturnType<typeof getOrderAdmin>>>;

type PageProps = {
  params: Promise<{id: string}>;
};

async function getOrderUserNames(
  order: Order,
): Promise<Record<string, string>> {
  const userIds = new Set<string>();

  userIds.add(order.updatedBy);
  order.statusLog?.forEach((entry) => userIds.add(entry.changedBy));
  order.paymentLog?.forEach((entry) => userIds.add(entry.performedBy));

  const userNames: Record<string, string> = {};

  await Promise.all(
    Array.from(userIds).map(async (userId) => {
      userNames[userId] = (await getUserNameById(userId)) ?? userId;
    }),
  );

  return userNames;
}

export default async function MerchOrderDetailPage({params}: PageProps) {
  const {id} = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  const order = await getOrderAdmin(orderId);

  if (!order) {
    notFound();
  }

  const userNames = await getOrderUserNames(order);

  return <OrderDetail order={order} userNames={userNames} />;
}

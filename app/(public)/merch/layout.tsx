import {CartFab} from '@/components/merch/CartFab';
import {CartProvider} from '@/components/merch/CartProvider';

export default function MerchLayout({children}: {children: React.ReactNode}) {
  return (
    <CartProvider>
      {children}
      <CartFab />
    </CartProvider>
  );
}

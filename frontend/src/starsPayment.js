import { purchaseProduct } from './api';

// Pays for `product` using the player's virtual Star Credit wallet first.
// If the wallet doesn't have enough Star Credits, automatically falls back
// to a real Telegram Stars invoice for that same item.
//
// Usage:
//   payWithStars({
//     player, product: 'chest_common',
//     onSuccess: (data) => { ...refresh player, show a message... },
//     onCancelled: () => { ...real-money invoice was dismissed... },
//     onError: (msg) => { ...show msg... },
//   });
export async function payWithStars({ player, product, onSuccess, onCancelled, onError }) {
  try {
    const res  = await purchaseProduct(player.telegram_id, product);
    const data = res.data;

    if (data.method === 'virtual_stars') {
      // Paid instantly from the player's Star Credit balance — no popup needed.
      onSuccess?.(data);
      return;
    }

    if (data.method === 'real_stars_invoice') {
      const link = data.link;
      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(link, (status) => {
          if (status === 'paid') onSuccess?.(data);
          else if (status === 'cancelled') onCancelled?.();
        });
      } else {
        window.open(link, '_blank');
      }
      return;
    }

    onError?.('Unexpected response from server.');
  } catch (err) {
    onError?.(err.response?.data?.error || 'Purchase failed. Try again.');
  }
}

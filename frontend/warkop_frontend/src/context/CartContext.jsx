import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ id_menu, nama_menu, harga, jumlah }]

  function addItem(menu) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id_menu === menu.id_menu);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], jumlah: updated[idx].jumlah + 1 };
        return updated;
      }
      return [...prev, { id_menu: menu.id_menu, nama_menu: menu.nama_menu, harga: menu.harga, jumlah: 1 }];
    });
  }

  function removeItem(id_menu) {
    setItems(prev => prev.filter(i => i.id_menu !== id_menu));
  }

  function updateQty(id_menu, jumlah) {
    if (jumlah <= 0) return removeItem(id_menu);
    setItems(prev => prev.map(i => i.id_menu === id_menu ? { ...i, jumlah } : i));
  }

  function clearCart() { setItems([]); }

  const total    = items.reduce((s, i) => s + i.harga * i.jumlah, 0);
  const itemCount= items.reduce((s, i) => s + i.jumlah, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

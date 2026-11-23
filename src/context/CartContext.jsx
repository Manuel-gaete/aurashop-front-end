import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'aurashop_carrito';

function cargarCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(cargarCarrito);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  function add(producto) {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.id === producto.id
            ? { ...i, stock: producto.stock, cantidad: Math.min(i.cantidad + 1, producto.stock) }
            : i
        );
      }
      const { id, nombre, precio, img, stock } = producto;
      return [...prev, { id, nombre, precio, img, stock, cantidad: 1 }];
    });
  }

  function setCantidad(id, cantidad) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) } : i))
    );
  }

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  const count = items.reduce((suma, i) => suma + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, add, setCantidad, remove, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

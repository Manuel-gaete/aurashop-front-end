import { useState } from 'react';
import { crearOrden } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { clp } from '../utils/format';
import ProductImage from './ProductImage';

const RETIRO = 'Retiro en tienda';
const DESPACHO = 'Despacho a domicilio';

export default function Carrito({ notify, goTo }) {
  const { items, total, setCantidad, remove, clear } = useCart();
  const { user } = useAuth();

  const [entrega, setEntrega] = useState(DESPACHO);
  const [direccion, setDireccion] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleComprar(e) {
    e.preventDefault();
    if (!user) {
      notify.error('Inicia sesión para finalizar tu compra.');
      goTo('login');
      return;
    }
    setEnviando(true);
    try {
      // El backend calcula precios y total: solo enviamos id y cantidad
      const payload = {
        entrega,
        direccion: entrega === RETIRO ? RETIRO : direccion.trim(),
        items: items.map((i) => ({ productoId: i.id, cantidad: i.cantidad })),
      };
      const orden = await crearOrden(payload);
      clear();
      notify.success(`¡Compra realizada! Orden ${orden.numero} por ${clp(orden.total)}.`);
      goTo('mis-ordenes');
    } catch (err) {
      notify.error(`No se pudo completar la compra: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="card">
        <div className="card-header">
          <h2>Tu carrito</h2>
        </div>
        <p className="empty-state">
          Tu carrito está vacío.{' '}
          <button className="link" onClick={() => goTo('tienda')}>
            Ir a la tienda
          </button>
        </p>
      </section>
    );
  }

  return (
    <div className="two-cols">
      <section className="card">
        <div className="card-header">
          <h2>Tu carrito ({items.length})</h2>
          <button className="btn btn-secondary" onClick={clear}>
            Vaciar
          </button>
        </div>
        <div className="list">
          {items.map((i) => (
            <div key={i.id} className="cart-item">
              <ProductImage img={i.img} nombre={i.nombre} className="cart-img" />
              <div className="cart-info">
                <div className="list-item-title">{i.nombre}</div>
                <div className="list-item-sub">{clp(i.precio)} c/u</div>
              </div>
              <div className="qty">
                <button className="btn btn-secondary" onClick={() => setCantidad(i.id, i.cantidad - 1)}>
                  −
                </button>
                <span>{i.cantidad}</span>
                <button
                  className="btn btn-secondary"
                  disabled={i.cantidad >= i.stock}
                  onClick={() => setCantidad(i.id, i.cantidad + 1)}
                >
                  +
                </button>
              </div>
              <strong className="cart-subtotal">{clp(i.precio * i.cantidad)}</strong>
              <button className="btn-icon" title="Quitar" onClick={() => remove(i.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Finalizar compra</h2>
        </div>
        <form className="form-box" onSubmit={handleComprar}>
          <div className="form-group">
            <label>Tipo de entrega</label>
            <select value={entrega} onChange={(e) => setEntrega(e.target.value)}>
              <option value={DESPACHO}>{DESPACHO}</option>
              <option value={RETIRO}>{RETIRO}</option>
            </select>
          </div>

          {entrega === DESPACHO && (
            <div className="form-group">
              <label>Dirección de despacho</label>
              <input
                required
                placeholder="Av. Siempre Viva 742, Santiago"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
          )}

          <div className="total-row">
            <span>Total estimado</span>
            <strong>{clp(total)}</strong>
          </div>
          <p className="list-item-sub">El total final lo confirma el servidor al crear la orden.</p>

          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Procesando...' : user ? 'Pagar y crear orden' : 'Inicia sesión para comprar'}
          </button>
        </form>
      </section>
    </div>
  );
}

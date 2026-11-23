import { clp, fechaHora } from '../utils/format';

// Tarjeta reutilizable: la usan "Mis órdenes" y el panel de órdenes del personal
export default function OrdenCard({ orden, mostrarCliente = false }) {
  return (
    <div className="orden-card">
      <div className="orden-header">
        <span>
          <strong>{orden.numero}</strong> · {fechaHora(orden.fecha)}
        </span>
        <span className="badge badge-ok">{orden.estado}</span>
      </div>

      {mostrarCliente && (
        <div className="list-item-sub">
          Cliente: {orden.cliente} ({orden.correo})
        </div>
      )}
      <div className="list-item-sub">
        {orden.entrega} — {orden.direccion}
      </div>

      <ul className="orden-items">
        {orden.items.map((i) => (
          <li key={i.productoId}>
            <span>
              {i.cantidad} × {i.nombre}
            </span>
            <span>{clp(i.precio * i.cantidad)}</span>
          </li>
        ))}
      </ul>

      <div className="total-row">
        <span>Total</span>
        <strong>{clp(orden.total)}</strong>
      </div>
    </div>
  );
}

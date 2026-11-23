import { useEffect, useMemo, useState } from 'react';
import { getOrdenes } from '../services/api';
import { clp } from '../utils/format';
import OrdenCard from './OrdenCard';

export default function AdminOrdenes({ notify }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      try {
        setOrdenes(await getOrdenes());
      } catch (err) {
        notify.error(`No se pudieron cargar las órdenes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // Más recientes primero + filtro por número, cliente o correo
  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    return [...ordenes]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .filter((o) => !t || [o.numero, o.cliente, o.correo].some((v) => v?.toLowerCase().includes(t)));
  }, [ordenes, busqueda]);

  const ventas = visibles.reduce((suma, o) => suma + o.total, 0);

  return (
    <section className="card">
      <div className="card-header">
        <h2>Todas las órdenes ({visibles.length})</h2>
        <span className="badge badge-ok">Ventas: {clp(ventas)}</span>
      </div>

      <div className="filters">
        <input
          className="search"
          placeholder="Buscar por número, cliente o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="empty-state">Cargando órdenes...</p>
      ) : visibles.length === 0 ? (
        <p className="empty-state">No hay órdenes registradas.</p>
      ) : (
        <div className="orden-grid">
          {visibles.map((o) => (
            <OrdenCard key={o.id} orden={o} mostrarCliente />
          ))}
        </div>
      )}
    </section>
  );
}

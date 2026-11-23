import { useEffect, useState } from 'react';
import { getMisOrdenes } from '../services/api';
import OrdenCard from './OrdenCard';

export default function MisOrdenes({ notify, goTo }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      try {
        setOrdenes(await getMisOrdenes());
      } catch (err) {
        notify.error(`No se pudieron cargar tus órdenes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  return (
    <section className="card">
      <div className="card-header">
        <h2>Mis órdenes ({ordenes.length})</h2>
      </div>
      {loading ? (
        <p className="empty-state">Cargando órdenes...</p>
      ) : ordenes.length === 0 ? (
        <p className="empty-state">
          Aún no has comprado nada.{' '}
          <button className="link" onClick={() => goTo('tienda')}>
            Ir a la tienda
          </button>
        </p>
      ) : (
        <div className="orden-grid">
          {ordenes.map((o) => (
            <OrdenCard key={o.id} orden={o} />
          ))}
        </div>
      )}
    </section>
  );
}

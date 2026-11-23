import { useEffect, useMemo, useState } from 'react';
import { getProductos, getCategorias } from '../services/api';
import { useCart } from '../context/CartContext';
import { clp } from '../utils/format';
import ProductImage from './ProductImage';

export default function Tienda({ notify }) {
  const { items, add } = useCart();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [soloOfertas, setSoloOfertas] = useState(false);

  useEffect(() => {
    cargarCatalogo();
  }, []);

  async function cargarCatalogo() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProductos(), getCategorias()]);
      setProductos(p);
      setCategorias(c);
    } catch (err) {
      notify.error(`No se pudo cargar el catálogo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Se recalcula solo cuando cambian los productos o los filtros
  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (categoria !== 'todas' && p.categoria?.id !== categoria) return false;
      if (soloOfertas && !p.oferta) return false;
      if (texto && !p.nombre.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [productos, busqueda, categoria, soloOfertas]);

  const cantidadEnCarrito = (id) => items.find((i) => i.id === id)?.cantidad ?? 0;

  function agregar(p) {
    add(p);
    notify.success(`"${p.nombre}" agregado al carrito.`);
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Catálogo ({filtrados.length})</h2>
        <label className="check">
          <input type="checkbox" checked={soloOfertas} onChange={(e) => setSoloOfertas(e.target.checked)} />
          Solo ofertas
        </label>
      </div>

      <div className="filters">
        <input
          className="search"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="chips">
          <button
            className={`chip ${categoria === 'todas' ? 'active' : ''}`}
            onClick={() => setCategoria('todas')}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              className={`chip ${categoria === c.id ? 'active' : ''}`}
              onClick={() => setCategoria(c.id)}
              title={c.descripcion}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Cargando catálogo...</p>
      ) : filtrados.length === 0 ? (
        <p className="empty-state">No hay productos que coincidan con tu búsqueda.</p>
      ) : (
        <div className="product-grid">
          {filtrados.map((p) => {
            const enCarrito = cantidadEnCarrito(p.id);
            const agotado = p.stock <= 0;
            const sinMas = enCarrito >= p.stock;
            return (
              <article key={p.id} className="product-card">
                {p.oferta && <span className="badge badge-offer">Oferta</span>}
                <ProductImage img={p.img} nombre={p.nombre} />
                <div className="product-body">
                  <div className="list-item-sub">{p.categoria?.nombre}</div>
                  <h3 className="product-name">{p.nombre}</h3>
                  <p className="product-desc">{p.descripcion}</p>
                  <div className="product-footer">
                    <strong className="price">{clp(p.precio)}</strong>
                    <span className={`stock ${agotado ? 'stock-out' : p.stock <= 5 ? 'stock-low' : ''}`}>
                      {agotado ? 'Agotado' : p.stock <= 5 ? `¡Últimas ${p.stock}!` : `Stock: ${p.stock}`}
                    </span>
                  </div>
                  <button className="btn btn-primary" disabled={agotado || sinMas} onClick={() => agregar(p)}>
                    {agotado ? 'Sin stock' : sinMas ? 'Máximo en carrito' : 'Agregar al carrito'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

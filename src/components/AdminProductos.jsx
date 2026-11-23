import { useEffect, useState } from 'react';
import {
  getProductos,
  getCategorias,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../services/api';
import { clp } from '../utils/format';
import ProductImage from './ProductImage';

const FORM_VACIO = { nombre: '', precio: '', stock: '', categoriaId: '', img: '', oferta: false, descripcion: '' };

export default function AdminProductos({ notify }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando
  const [form, setForm] = useState(FORM_VACIO);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProductos(), getCategorias()]);
      setProductos(p);
      setCategorias(c);
    } catch (err) {
      notify.error(`No se pudieron cargar los productos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevo() {
    setEditandoId(null);
    setForm({ ...FORM_VACIO, categoriaId: categorias[0]?.id || '' });
    setShowForm(true);
  }

  function abrirEdicion(p) {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoria?.id || '',
      img: p.img || '',
      oferta: !!p.oferta,
      descripcion: p.descripcion || '',
    });
    setShowForm(true);
  }

  function cerrarForm() {
    setShowForm(false);
    setEditandoId(null);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    // El backend espera { ..., categoria: { id } }
    const payload = {
      nombre: form.nombre,
      precio: Number(form.precio),
      stock: Number(form.stock),
      oferta: form.oferta,
      img: form.img,
      descripcion: form.descripcion,
      categoria: { id: form.categoriaId },
    };
    try {
      if (editandoId) {
        await updateProducto(editandoId, payload);
        notify.success(`Producto "${form.nombre}" actualizado.`);
      } else {
        await createProducto(payload);
        notify.success(`Producto "${form.nombre}" creado.`);
      }
      cerrarForm();
      cargar();
    } catch (err) {
      notify.error(`Error al guardar el producto: ${err.message}`);
    }
  }

  async function handleEliminar(p) {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await deleteProducto(p.id);
      setProductos((prev) => prev.filter((x) => x.id !== p.id));
      notify.success(`Producto "${p.nombre}" eliminado.`);
    } catch (err) {
      notify.error(`No se pudo eliminar (¿tiene órdenes asociadas?): ${err.message}`);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Productos ({productos.length})</h2>
        <button className="btn btn-primary" onClick={showForm ? cerrarForm : abrirNuevo}>
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <form className="form-box" onSubmit={handleGuardar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                required
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio ($ CLP)</label>
              <input
                type="number"
                min="0"
                required
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Imagen (nombre del archivo en /public/img)</label>
            <input
              placeholder="mouseGamer.webp"
              value={form.img}
              onChange={(e) => setForm({ ...form, img: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              rows="3"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
          <label className="check">
            <input type="checkbox" checked={form.oferta} onChange={(e) => setForm({ ...form, oferta: e.target.checked })} />
            Producto en oferta
          </label>
          <button type="submit" className="btn btn-primary">
            {editandoId ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="empty-state">Cargando productos...</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <ProductImage img={p.img} nombre={p.nombre} className="thumb" />
                  </td>
                  <td>
                    {p.nombre} {p.oferta && <span className="badge badge-offer inline">Oferta</span>}
                  </td>
                  <td>{p.categoria?.nombre}</td>
                  <td>{clp(p.precio)}</td>
                  <td>{p.stock}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => abrirEdicion(p)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleEliminar(p)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

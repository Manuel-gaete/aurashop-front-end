import { useEffect, useState } from 'react';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/api';

const FORM_VACIO = { id: '', nombre: '', descripcion: '' };

export default function AdminCategorias({ notify }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    try {
      setCategorias(await getCategorias());
    } catch (err) {
      notify.error(`No se pudieron cargar las categorías: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevo() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setShowForm(true);
  }

  function abrirEdicion(c) {
    setEditandoId(c.id);
    setForm({ id: c.id, nombre: c.nombre, descripcion: c.descripcion || '' });
    setShowForm(true);
  }

  function cerrarForm() {
    setShowForm(false);
    setEditandoId(null);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await updateCategoria(editandoId, form);
        notify.success(`Categoría "${form.nombre}" actualizada.`);
      } else {
        await createCategoria({ ...form, id: form.id.trim().toLowerCase() });
        notify.success(`Categoría "${form.nombre}" creada.`);
      }
      cerrarForm();
      cargar();
    } catch (err) {
      notify.error(`Error al guardar la categoría: ${err.message}`);
    }
  }

  async function handleEliminar(c) {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    try {
      await deleteCategoria(c.id);
      setCategorias((prev) => prev.filter((x) => x.id !== c.id));
      notify.success(`Categoría "${c.nombre}" eliminada.`);
    } catch (err) {
      notify.error(`No se pudo eliminar (¿tiene productos asociados?): ${err.message}`);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Categorías ({categorias.length})</h2>
        <button className="btn btn-primary" onClick={showForm ? cerrarForm : abrirNuevo}>
          {showForm ? 'Cancelar' : '+ Nueva'}
        </button>
      </div>

      {showForm && (
        <form className="form-box" onSubmit={handleGuardar}>
          <div className="form-group">
            <label>Id (único, sin espacios)</label>
            <input
              required
              disabled={!!editandoId}
              pattern="[a-zA-Z0-9_-]+"
              placeholder="monitores"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input required placeholder="Monitores" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea rows="2" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">
            {editandoId ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="empty-state">Cargando categorías...</p>
      ) : (
        <div className="list">
          {categorias.map((c) => (
            <div key={c.id} className="list-item static row-between">
              <div>
                <div className="list-item-title">
                  {c.nombre} <span className="list-item-sub">({c.id})</span>
                </div>
                <div className="list-item-sub">{c.descripcion}</div>
              </div>
              <div className="actions">
                <button className="btn btn-secondary" onClick={() => abrirEdicion(c)}>
                  Editar
                </button>
                <button className="btn btn-danger" onClick={() => handleEliminar(c)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
